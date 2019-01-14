const BrokerConfig = require(`../config`).broker;
const CONST = require('../util/constants.json');
const mosca = require('mosca');
const ApplicationLogger = require(`./ApplicationLogger.js`);
const CrossBrokerCommunicator = require(`./CrossBrokerCommunicator.js`);
const BrokerProcessMonitoring = require(`./BrokerProcessMonitoring.js`);
const WebSocketManager = require('../lib/WebSocketManager.js');
const TopicStructure = require('../lib/TopicStructure.js');
const SubscriptionManager = require('../lib/SubscriptionManager.js');
const DeviceHiveUtils = require('../util/DeviceHiveUtils.js');
const messageBusDistributor = require('./proxy/MessageBusDistributor');


const appLogger = new ApplicationLogger(BrokerConfig.APP_LOG_LEVEL);
const crossBrokerCommunicator = new CrossBrokerCommunicator();
const brokerProcessMonitoring = new BrokerProcessMonitoring();
const subscriptionManager = new SubscriptionManager();
const wsManager = new WebSocketManager(BrokerConfig.WS_SERVER_URL);
const server = new mosca.Server({
    port: BrokerConfig.BROKER_PORT,
    http: {
        port: BrokerConfig.BROKER_WS_PORT,
        bundle: true,
        static: './'
    },
    stats: true,
    persistence: {
        factory: mosca.persistence.Redis,
        host: BrokerConfig.REDIS_SERVER_HOST,
        port: BrokerConfig.REDIS_SERVER_PORT,
        ttl: {
            subscriptions: CONST.PERSISTENCE.MAX_NUMBER_OF_SUBSCRIPTIONS,
            packets: CONST.PERSISTENCE.MAX_NUMBER_OF_PACKETS
        }
    }
});

crossBrokerCommunicator.on(`message`, (topic, payload) => server.publish({ topic: topic, payload: payload }));

wsManager.on('message', (clientId, message) => {
    const messageObject = JSON.parse(message.data);

    handleTokenAndAuthResponses(messageObject, clientId);

    if (messageObject.subscriptionId) {
        const topic = subscriptionManager.findSubject(clientId, messageObject.subscriptionId);

        if (topic) {
            if (messageObject.action === DeviceHiveUtils.getTopicSubscriptionResponseAction(topic)) {
                const mostGlobalTopic = subscriptionManager.getAllSubjects()
                    .filter((existingTopic) => DeviceHiveUtils.isSameTopicRoot(existingTopic, topic))
                    .sort((topic1, topic2) => !DeviceHiveUtils.isMoreGlobalTopic(topic1, topic2))[0];

                if (mostGlobalTopic === topic) {
                    (subscriptionManager.getSubscriptionExecutor(topic, () => {
                        server.publish({
                            topic: TopicStructure.toTopicString(messageObject),
                            payload: message.data
                        });

                        appLogger.debug(`broker has published to topic: "${topic}"`);
                    }))();
                }
            }
        }
    } else {
        const topic = TopicStructure.toTopicString(messageObject, clientId);

        if (subscriptionManager.hasSubscriptionAttempt(clientId, topic)) {
            server.publish({
                topic: topic,
                payload: message.data
            });

            appLogger.debug(`broker has published to private topic: "${topic}"`);
        }
    }
});

messageBusDistributor.on(`message`, (clientId, message) => {

});

server.authenticate = function (client, username, password, callback) {
    brokerAuthenticationHandler(client.id, username, password)
        .then(() => {
            appLogger.debug(`client with id: "${client.id}" has been authenticated`);
            callback(null, true);
        })
        .catch((err) => {
            appLogger.warn(`client with id: "${client.id}" has not been authenticated. Reason: ${err.toString()}`);
            callback(err, false);
        });
};

server.authorizePublish = function (client, topic, payload, callback) {
    const topicStructure = new TopicStructure(topic);
    const isAuthorized = topicStructure.isDH() ? topicStructure.isRequest() || 'ignore' : true;

    isAuthorized === true ?
        appLogger.debug(`client with id: "${client.id}" has been authorized for publishing in to the topic: "${topic}"`) :
        appLogger.warn(`client with id: "${client.id}" has not been authorized for publishing in to the topic: "${topic}"`);

    if (isAuthorized) {
        wsManager.lock(client.id);
    }

    callback(null, isAuthorized);
};

server.authorizeForward = function (client, packet, callback) {
    const topicStructure = new TopicStructure(packet.topic);
    const isAuthorized = topicStructure.hasOwner() ? topicStructure.getOwner() === client.id : true;

    isAuthorized === true ?
        appLogger.debug(`client with id: "${client.id}" has been authorized for receiving packet on the topic: "${packet.topic}"`) :
        appLogger.warn(`client with id: "${client.id}" has not been authorized for receiving packet on the topic: "${packet.topic}"`);

    callback(null, isAuthorized);
};

server.authorizeSubscribe = function (client, topic, callback) {
    brokerAuthorizeSubscriptionHandler(client.id, topic)
        .then(() => {
            appLogger.debug(`client with id: "${client.id}" has been subscribed for topic: "${topic}"`);
            callback(null, true);
        })
        .catch((err) => {
            appLogger.warn(`client with id: "${client.id}" has not been subscribed for topic: "${topic}". Reason: ${err.toString()}`);
            callback(null, false);
        });
};

server.on(`ready`, () => {
    appLogger.info(`broker has been started on port: ${BrokerConfig.BROKER_PORT}`);
});

server.on(`clientConnected`, (client) => {
    appLogger.info(`client with id: "${client.id}" connected`);
});

server.on(`clientDisconnected`, (client) => {
    wsManager.close(client.id);
    appLogger.info(`client with id: "${client.id}" disconnected`);
});

server.on(`published`, (packet, client) => {
    if (client) {
        const topicStructure = new TopicStructure(packet.topic);

        if (topicStructure.isDH()) {
            if (topicStructure.isRequest()) {
                wsManager.sendString(client.id, packet.payload.toString());
            }
        } else if (messageBusDistributor.isRegistered(topicStructure.getDomain())) {
            messageBusDistributor.publish(packet)
        } else {
            crossBrokerCommunicator.publish(packet.topic, packet.payload.toString());
        }

        appLogger.debug(`client with id: "${client.id}" has published to topic: "${packet.topic}"`);

        wsManager.unlock(client.id);
    } else {
        if (isBrokerSYSTopic(packet.topic)) {
            brokerProcessMonitoring.updateMetric(convertTopicToMetricName(packet.topic), packet.payload.toString());
        }
    }
});

server.on('unsubscribed', (topic, client) => {
    if (isDeviceHiveTopic(topic)) {
        const subscriptionId = subscriptionManager.findSubscriptionId(client.id, topic);

        subscriptionManager.removeSubscriptionAttempt(client.id, topic);

        if (isDeviceHiveEventSubscriptionTopic(topic) && subscriptionId) {
            unsubscribe(client.id, topic, subscriptionId)
                .then(() => {
                    subscribeToNextMostGlobalTopic(client.id, topic);
                    subscriptionManager.removeSubjectSubscriber(topic, client.id);

                    appLogger.debug(`client with id: "${client.id}" has unsubscribed from topic: ${topic}`);
                })
                .catch((err) => appLogger.warn(`client with id: "${client.id}" has problems with unsubscribing from topic: ${topic}: ${err.toString()}`));
        } else {
            appLogger.debug(`client with id: "${client.id}" has unsubscribed from DeviceHive topic: ${topic}`);
        }
    } else {
        appLogger.debug(`client with id: "${client.id}" has unsubscribed from topic: ${topic}`);
    }
});


/**
 * Part of broker flow. Check that the topic is forbidden to subscribe
 * @param topic
 * @returns {boolean}
 */
function isTopicForbidden (topic) {
    return CONST.TOPICS.FORBIDDEN.START_WITH.some(str => str.startsWith(topic));
}

/**
 * Part of broker flow. Check that the topic concerns to DeviceHive
 * @param topic
 * @returns {boolean}
 */
function isDeviceHiveEventSubscriptionTopic (topic) {
    const topicStructure = new TopicStructure(topic);
    return topicStructure.isDH() && topicStructure.isSubscription() &&
        (topicStructure.isNotification() || topicStructure.isCommandInsert() || topicStructure.isCommandUpdate());
}

/**
 * Part of broker flow. Check that there are has a more global topic then "topic" parameter
 * @param clientId
 * @param topic
 * @returns {boolean}
 */
function hasMoreGlobalTopicAttempts (clientId, topic) {
    return subscriptionManager.getSubscriptionAttempts(clientId)
        .some((subjectAttempt) => DeviceHiveUtils.isMoreGlobalTopic(subjectAttempt, topic));
}

/**
 * Part of broker flow. Subscribe client with "clientId" to "topic" via WS
 * @param clientId
 * @param topic
 * @returns {Promise.<Object>}
 */
function subscribe (clientId, topic) {
    return wsManager.send(clientId, DeviceHiveUtils.createSubscriptionDataObject(topic));
}

/**
 * Part of broker flow. Unsubscribe client with "clientId" from "topic" with
 * mentioned "subscriptionId" via WS
 * @param clientId
 * @param topic
 * @param subscriptionId
 * @returns {Promise.<Object>}
 */
function unsubscribe (clientId, topic, subscriptionId) {
    return wsManager.send(clientId, {
        action: DeviceHiveUtils.getTopicUnsubscribeRequestAction(topic),
        subscriptionId: subscriptionId
    });
}

/**
 * Part of broker flow. Unsubscribe client with "clientId" from topics
 * that are less global then "topic"
 * @param clientId
 * @param topic
 */
function unsubscribeFromLessGlobalTopics (clientId, topic) {
    subscriptionManager.getSubjects(clientId)
        .filter((subscription) => DeviceHiveUtils.isMoreGlobalTopic(topic, subscription))
        .forEach((topicToUnsubscribe) => {
            const subscriptionId = subscriptionManager.findSubscriptionId(clientId, topicToUnsubscribe);

            if (subscriptionId) {
                unsubscribe(clientId, topicToUnsubscribe, subscriptionId)
                    .then(() => subscriptionManager.removeSubjectSubscriber(topicToUnsubscribe, clientId))
                    .catch((err) => appLogger.warn(`client with id: "${clientid}" has problems with unsubscribing from topic: ${topic}: ${err.toString()}`));
            }
        });
}

/**
 * Part of broker flow. Check if the client with "clientId" is
 * still subscribed to the "topic"
 * @param clientId
 * @param topic
 * @returns {boolean}
 */
function isSubscriptionActual (clientId, topic) {
    return subscriptionManager.hasSubscriptionAttempt(clientId, topic);
}

/**
 * Part of broker flow. Subscribe client with "clientId" to the topic
 * that is more global then "topic"
 * @param clientId
 * @param topic
 */
function subscribeToNextMostGlobalTopic (clientId, topic) {
    const subscriberSubscriptions = subscriptionManager.getSubscriptionAttempts(clientId);
    const nextMostGlobalTopic = subscriberSubscriptions
        .filter((existingSubject) => DeviceHiveUtils.isLessGlobalTopic(existingSubject, topic))
        .sort((subject1, subject2) => !DeviceHiveUtils.isMoreGlobalTopic(subject1, subject2))[0];

    if (nextMostGlobalTopic) {
        subscribe(clientId, nextMostGlobalTopic)
            .then((subscriptionResponse) => subscriptionManager.addSubjectSubscriber(
                nextMostGlobalTopic, clientId, subscriptionResponse.subscriptionId))
            .catch((err) => appLogger.warn(`client with id: "${clientId}" has problems with subscribing for topic: ${topic}: ${err.toString()}`));
    }
}

/**
 * Part of broker flow. Check that topic is subscription to ws response
 * @param topic
 * @returns {boolean}
 */
function isDeviceHiveResponseSubscriptionTopic (topic) {
    const topicStructure = new TopicStructure(topic);

    return topicStructure.isDH() && topicStructure.isResponse();
}

/**
 * Check that topic is DH topic
 * @param topic
 * @return {boolean}
 */
function isDeviceHiveTopic (topic) {
    return (new TopicStructure(topic)).isDH();
}

/**
 * Check that topic is
 * @param topic
 * @return {boolean}
 */
function isDeviceHiveTokensOrAuthResponseTopic (topic) {
    const topicStructure = new TopicStructure(topic);
    const action = topicStructure.getAction();

    return topicStructure.isDH() && topicStructure.isResponse() &&
        (action === CONST.TOPICS.PARTS.TOKEN || action === CONST.TOPICS.PARTS.AUTHENTICATE);
}

/**
 * Handle token and auth responses
 * @param messageObject
 * @param clientId
 */
function handleTokenAndAuthResponses (messageObject, clientId) {
    if (messageObject.status === CONST.WS.SUCCESS_STATUS && wsManager.hasKey(clientId)) {
        switch (messageObject.action) {
            case CONST.WS.ACTIONS.TOKEN:
                wsManager.setTokens(clientId, messageObject.accessToken, messageObject.refreshToken);
                break;
            case CONST.WS.ACTIONS.AUTHENTICATE:
                wsManager.setAuthorized(clientId);
                break;
        }
    }
}

/**
 * Client authentication handler
 * @param clientId
 * @param username
 * @param password
 * @return {Promise}
 */
function brokerAuthenticationHandler (clientId, username, password) {
    return new Promise((resolve, reject) => {
        if (!wsManager.hasKey(clientId)) {
            if (username && password) {
                wsManager.createTokens(clientId, username, password.toString())
                    .then(({ accessToken, refreshToken }) => wsManager.authenticate(clientId, accessToken))
                    .then(() => process.nextTick(() => resolve()))
                    .catch((err) => process.nextTick(() => {
                        wsManager.close(clientId);
                        reject(err);
                    }));
            } else {
                resolve();
            }
        } else {
            reject(new Error(`User with id ${clientId} already connected`));
        }
    });
}

/**
 * Client subscription authorization handler
 * @param clientId
 * @param topic
 * @return {Promise}
 */
function brokerAuthorizeSubscriptionHandler (clientId, topic) {
    return new Promise((resolve, reject) => {
        if (!isTopicForbidden(topic)) {
            if (isDeviceHiveTopic(topic)) {
                if (wsManager.isAuthorized(clientId)) {
                    if (isDeviceHiveEventSubscriptionTopic(topic)) {
                        if (!hasMoreGlobalTopicAttempts(clientId, topic)) {
                            subscribe(clientId, topic)
                                .then((subscriptionResponse) => {
                                    if (isSubscriptionActual(clientId, topic)) {
                                        unsubscribeFromLessGlobalTopics(clientId, topic);
                                        subscriptionManager.addSubjectSubscriber(topic, clientId, subscriptionResponse.subscriptionId);
                                        resolve();
                                    } else {
                                        unsubscribe(clientId, topic, subscriptionResponse.subscriptionId)
                                            .then(() => process.nextTick(() => reject(`Subscription is not actual anymore`)))
                                            .catch((err) => process.nextTick(() => {
                                                appLogger.warn(`Problem while unsubscribing client from not actual topic "${topic}". Reason: ${err.toString()}`);
                                            }));
                                    }
                                })
                                .catch((err) => process.nextTick(() => reject(err)));
                        } else {
                            resolve();
                        }

                        subscriptionManager.addSubscriptionAttempt(clientId, topic);
                    } else if (isDeviceHiveResponseSubscriptionTopic(topic)) {
                        subscriptionManager.addSubscriptionAttempt(clientId, topic);
                        resolve();
                    } else {
                        subscriptionManager.addSubscriptionAttempt(clientId, topic);
                        resolve();
                    }
                } else {
                    if (isDeviceHiveTokensOrAuthResponseTopic(topic)) {
                        subscriptionManager.addSubscriptionAttempt(clientId, topic);
                        resolve();
                    } else {
                        reject(`Topic "${topic}" is forbidden for subscription for not authorized clients`);
                    }
                }
            } else {
                const topicStructure = new TopicStructure(topic);

                if (messageBusDistributor.isRegistered(topicStructure.getDomain())) {
                    if (wsManager.isAuthorized(clientId)) {
                        resolve();
                    } else {
                        reject(`Topics with domain "${topic}" is forbidden for subscription for not authorized clients`);
                    }
                } else {
                    resolve();
                }
            }
        } else {
            reject(`Topic "${topic}" is forbidden for subscription`);
        }
    });
}

/**
 * Check if topic is broker system message
 * @param topic
 * @return {boolean}
 */
function isBrokerSYSTopic (topic) {
    return topic.startsWith(`${CONST.MQTT.SYS_PREFIX}/${server.id}`);
}

/**
 * Convert system status topic to metric name
 * @param topic
 * @return {string}
 */
function convertTopicToMetricName(topic) {
    return topic.split(`${CONST.MQTT.SYS_PREFIX}/${server.id}/`)[1];
}
