const CONST = require('../util/constants.json');
const mosca = require('mosca');
const WebSocketManager = require('../lib/WebSocketManager.js');
const TopicStructure = require('../lib/TopicStructure.js');
const SubscriptionManager = require('../lib/SubscriptionManager.js');
const DeviceHiveUtils = require('../util/DeviceHiveUtils.js');

const IS_DEV = process.env.NODE_ENV === CONST.DEV;
//const WS_SERVER_URL = IS_DEV ? CONST.WS.DEV_HOST : process.env.WS_SERVER_URL;
const WS_SERVER_URL = `ws://playground.dev.devicehive.com/api/websocket`;
const SECURE_KEY = `./../cert/key.pem`;
const SECURE_CERT = `./../cert/cert.pem`;

const subscriptionManager = new SubscriptionManager();
const wsManager = new WebSocketManager(WS_SERVER_URL);
const server = new mosca.Server({
    interfaces: [
        { type: "mqtt", port: CONST.MQTT.PORT },
        { type: "mqtts", port: CONST.MQTT.TLS_PORT, credentials: { keyPath: SECURE_KEY, certPath: SECURE_CERT, passphrase: `qwertyui` } }
    ],
    persistence: {
        factory: mosca.persistence.Memory
    }
});


wsManager.on('message', (clientId, message) => {
    const messageData = JSON.parse(message.data);

    if (messageData.subscriptionId) {
        const topic = subscriptionManager.findSubject(clientId, messageData.subscriptionId);

        if (topic) {
            if (messageData.action === DeviceHiveUtils.getTopicSubscriptionResponseAction(topic)) {
                const mostGlobalTopic = subscriptionManager.getAllSubjects()
                    .filter((existingTopic) => DeviceHiveUtils.isSameTopicRoot(existingTopic, topic))
                    .sort((topic1, topic2) => !DeviceHiveUtils.isMoreGlobalTopic(topic1, topic2))[0];

                if (mostGlobalTopic === topic) {
                    (subscriptionManager.getSubscriptionExecutor(topic, () => {
                        server.publish({
                            topic: TopicStructure.toTopicString(messageData),
                            payload: message.data
                        });
                    }))();
                }
            }
        }
    } else {
        const topic = TopicStructure.toTopicString(messageData, clientId);

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
            createTokenByLoginInfo(client.id, username, password.toString())
                .then(({ accessToken, refreshToken }) => authenticate(client.id, accessToken))
                .then(() => process.nextTick(() => callback(null, true)))
                .catch((err) => process.nextTick(() => callback(null, false)));
        } else {
            callback(null, false);
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
    if (isDeviceHiveEventSubscriptionTopic(topic)) {
        const subscriptionId = subscriptionManager.findSubscriptionId(client.id, topic);

        subscriptionManager.removeSubscriptionAttempt(client.id, topic);

        if (subscriptionId) {
            unsubscribe(client.id, topic, subscriptionId)
                .then(() => {
                    subscribeToNextMostGlobalTopic(client.id, topic);

                    subscriptionManager.removeSubjectSubscriber(topic, client.id);
                })
                .catch((err) => console.warn(err));
        }
    } else if (isDeviceHiveResponseSubscriptionTopic(topic)) {
        subscriptionManager.removeSubscriptionAttempt(client.id, topic);
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
 * Get access and refresh token for by user credentials
 * @param clientId {string} - client id
 * @param login {String} - user login
 * @param password {String} = user password
 * @returns {Promise}
 */
function createTokenByLoginInfo (clientId, login, password) {
    return wsManager.send(clientId, {
        action: CONST.WS.ACTIONS.TOKEN,
        login: login,
        password: password
    }).then((tokens) => {
        wsManager.setTokens(clientId, tokens);

        return tokens;
    });
}

/**
 * Authenticate user by accessToken
 * @param clientId {string} client id
 * @param accessToken {string}
 * @returns {Promise}
 */
function authenticate (clientId, accessToken) {
    return wsManager.send(clientId, {
        action: CONST.WS.ACTIONS.AUTHENTICATE,
        token: accessToken
    })
}