const CONST = require('../util/constants.json');
const mosca = require('mosca');
const WebSocketManager = require('../lib/WebSocketManager.js');
const TopicStructure = require('../lib/TopicStructure.js');
const SubscriptionManager = require('../lib/SubscriptionManager.js');
const DeviceHiveUtils = require('../util/DeviceHiveUtils.js');

/**
 * Environmental variables
 * NODE_ENV - "dev" for development
 * WS_SERVER_URL - path to Web Socket server
 * REDIS_SERVER_HOST - Redis storage host
 * REDIS_SERVER_PORT - Redis storage port
 */

const IS_DEV = process.env.NODE_ENV === CONST.DEV;
const WS_SERVER_URL = process.env.WS_SERVER_URL || CONST.WS.DEV_HOST;
const REDIS_SERVER_HOST = process.env.REDIS_SERVER_HOST || CONST.PERSISTENCE.REDIS_DEV_HOST;
const REDIS_SERVER_PORT = process.env.REDIS_SERVER_PORT || CONST.PERSISTENCE.REDIS_DEV_PORT;

const subscriptionManager = new SubscriptionManager();
const wsManager = new WebSocketManager(WS_SERVER_URL);
const server = new mosca.Server({
    port: CONST.MQTT.PORT,
    persistence: {
        factory: mosca.persistence.Redis,
        host: REDIS_SERVER_HOST,
        port: REDIS_SERVER_PORT,
        ttl: {
            subscriptions: CONST.PERSISTENCE.MAX_NUMBER_OF_SUBSCRIPTIONS,
            packets: CONST.PERSISTENCE.MAX_NUMBER_OF_PACKETS
        }
    }
});


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
        }
    }
});

server.authenticate = function (client, username, password, callback) {
    if (!wsManager.hasKey(client.id)) {
        if (username && password) {
            wsManager.createTokens(client.id, username, password.toString())
                .then(({ accessToken, refreshToken }) => wsManager.authenticate(client.id, accessToken))
                .then(() => process.nextTick(() => callback(null, true)))
                .catch((err) => process.nextTick(() => callback(null, false)));
        } else {
            callback(null, true);
        }
    } else {
        callback(null, false);
    }
};

server.authorizePublish = function (client, topic, payload, callback) {
    const topicStructure = new TopicStructure(topic);

    callback(null, topicStructure.isDH() ? topicStructure.isRequest() || 'ignore' : true);
};

server.authorizeForward = function (client, packet, callback) {
    const topicStructure = new TopicStructure(packet.topic);

    callback(null, topicStructure.hasOwner() ? topicStructure.getOwner() === client.id : true);
};

server.authorizeSubscribe = function (client, topic, callback) {
    if (!isTopicForbidden(topic)) {
        if (isDeviceHiveTopic(topic)) {
            if (wsManager.isAuthorized(client.id)) {
                if (isDeviceHiveEventSubscriptionTopic(topic)) {
                    if (!hasMoreGlobalTopicAttempts(client.id, topic)) {
                        subscribe(client.id, topic)
                            .then((subscriptionResponse) => {
                                if (isSubscriptionActual(client.id, topic)) {
                                    unsubscribeFromLessGlobalTopics(client.id, topic);
                                    subscriptionManager.addSubjectSubscriber(topic, client.id, subscriptionResponse.subscriptionId);
                                    callback(null, true);
                                } else {
                                    unsubscribe(client.id, topic, subscriptionResponse.subscriptionId)
                                        .then(() => process.nextTick(() => callback(null, false)))
                                        .catch((err) => process.nextTick(() => console.warn(err)));
                                }
                            })
                            .catch(() => process.nextTick(() => callback(null, false)));
                    } else {
                        callback(null, true);
                    }

                    subscriptionManager.addSubscriptionAttempt(client.id, topic);
                } else if (isDeviceHiveResponseSubscriptionTopic(topic)) {
                    subscriptionManager.addSubscriptionAttempt(client.id, topic);
                    callback(null, true);
                } else {
                    subscriptionManager.addSubscriptionAttempt(client.id, topic);
                    callback(null, true);
                }
            } else {
                if (isDeviceHiveTokensOrAuthResponseTopic(topic)) {
                    subscriptionManager.addSubscriptionAttempt(client.id, topic);
                    callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        } else {
            callback(null, true);
        }
    } else {
        callback(null, false);
    }
};

server.on('ready', () => {
    console.log('MQTT Broker has been started');
});

server.on('clientDisconnected', (client) => {
    wsManager.close(client.id);
});

server.on('published', (packet, client) => {
    if (client) {
        const topicStructure = new TopicStructure(packet.topic);

        if (topicStructure.isRequest()) {
            wsManager.sendString(client.id, packet.payload.toString());
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
                })
                .catch((err) => console.warn(err));
        }
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
    return wsManager.send(clientId, DeviceHiveUtils.createSubscriptionDataObject(topic))
        .catch(err => console.warn(err));
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
        })
        .catch(err => console.warn(err));
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
                    .catch((err) => console.warn(err));
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
            .catch((err) => console.warn(err));
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