require('events').EventEmitter.prototype._maxListeners = 20;

const CONST = require('../util/constants.json');
const mosca = require('mosca');
const WebSocketFactory = require('../lib/WebSocketFactory.js');
const TopicStructure = require('../lib/TopicStructure.js');
const SubscriptionManager = require('../lib/SubscriptionManager.js');
const DeviceHiveUtils = require('../util/DeviceHiveUtils.js');

const IS_DEV = process.env.NODE_ENV === CONST.DEV;
const WS_SERVER_URL = IS_DEV ? CONST.WS.DEV_HOST : process.env.WS_SERVER_URL;
const FORBIDDEN_TO_SUBSCRIBE_TOPICS = [
    CONST.TOPICS.TOKEN,
    CONST.TOPICS.DH_AUTHENTICATION
];

let subscriptionManager = new SubscriptionManager();
let wsFactory = new WebSocketFactory(WS_SERVER_URL);
let server = new mosca.Server({ port: CONST.MQTT.PORT });


wsFactory.on('globalMessage', (message, clientId) => {
    let data = JSON.parse(message.data);
    let topic = subscriptionManager.findSubject(clientId, data.subscriptionId);

    if (topic) {
        if (data.action === DeviceHiveUtils.getTopicResponseAction(topic)) {
            let mostGlobalTopic = subscriptionManager.getAllSubjects()
                .filter((existingTopic) => DeviceHiveUtils.isSameTopicRoot(existingTopic, topic))
                .sort((topic1, topic2) => !DeviceHiveUtils.isMoreGlobalTopic(topic1, topic2))[0];

            if (mostGlobalTopic === topic) {
                (subscriptionManager.getSubscriptionExecutor(topic, () => {
                    server.publish({
                        topic: transformNotificationDataToTopic(data), // TODO create topic from payload
                        payload: message.data
                    });
                }))();
            }
        }
    }
});

server.authenticate = function (client, username, password, callback) {
    if (!wsFactory.hasSocket(client.id)) {
        if (username && password) {
            wsFactory.getSocket(client.id)
                .then((wSocket) => {
                    wSocket.createTokenByLoginInfo(username, password.toString())
                        .then(({accessToken, refreshToken}) => wSocket.authenticate(accessToken))
                        .then(() => callback(null, true))
                        .catch((err) => callback(null, false));
                })
        } else {
            callback(null, false);
        }
    } else {
        callback(null, false);
    }
};

server.authorizeForward = function (client, packet, callback) {
    let topicOwner = DeviceHiveUtils.getClientFromTopic(packet.topic);

    callback(null, topicOwner ? topicOwner === client.id : true);
};

server.authorizeSubscribe = function (client, topic, callback) {
    if (!isTopicForbidden(topic)) {
        if (isDeviceHiveTopic(topic)) {
            if (!hasMoreGlobalTopicAttempts(client.id, topic)) {
                subscribe(client.id, topic)
                    .then((subscriptionResponse) => {
                        unsubscribeFromLessGlobalTopics(client.id, topic);

                        if (isSubscriptionActual(client.id, topic)) {
                            subscriptionManager.addSubjectSubscriber(topic, client.id, subscriptionResponse.subscriptionId);
                            callback(null, true);
                        } else {
                            unsubscribe(client.id, topic, subscriptionResponse.subscriptionId)
                                .then(() => callback(null, false))
                                .catch((err) => console.warn(err));
                        }
                    })
                    .catch(() => callback(null, false));
            } else {
                callback(null, true);
            }

            subscriptionManager.addSubscriptionAttempt(client.id, topic);
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
    wsFactory.removeSocket(client.id)
        //.then(() => subscriptionManager.removeSubscriber(client.id))
        .catch((err) => console.warn(err));
});

server.on('published', (packet, client) => {
    if (client) {
        switch (packet.topic) {
            case CONST.TOPICS.TOKEN:
            case CONST.TOPICS.DH_AUTHENTICATION:
                wsFactory.getSocket(client.id)
                    .then((wSocket) => wSocket.send(JSON.parse(packet.payload.toString()))) // TODO remove JSON.parse
                    .then((data) => server.publish({
                        topic: DeviceHiveUtils.getClientTopic(packet.topic, client),
                        payload: JSON.stringify(data)
                    }))
                    .catch((err) => {
                        console.warn('on publish', err)
                    });
                break;
        }
    }
});

server.on('unsubscribed', (topic, client) => {
    if (isDeviceHiveTopic(topic)) {
        let subscriptionId = subscriptionManager.findSubscriptionId(client.id, topic);

        subscriptionManager.removeSubscriptionAttempt(client.id, topic);

        if (subscriptionId) {
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
 *
 * @param topic
 * @returns {boolean}
 */
function isTopicForbidden (topic) {
    return FORBIDDEN_TO_SUBSCRIBE_TOPICS.includes(topic);
}

/**
 *
 * @param topic
 * @returns {boolean}
 */
function isDeviceHiveTopic (topic) {
    return (new TopicStructure(topic)).isDH();
}

/**
 *
 * @param clientId
 * @param topic
 * @returns {boolean}
 */
function hasMoreGlobalTopicAttempts (clientId, topic) {
    return subscriptionManager.getSubscriptionAttempts(clientId)
        .some((subjectAttempt) => DeviceHiveUtils.isMoreGlobalTopic(subjectAttempt, topic));
}

/**
 *
 * @param clientId
 * @param topic
 * @returns {Promise.<Object>}
 */
function subscribe (clientId, topic) {
    let topicStructure = new TopicStructure(topic);

    return wsFactory.getSocket(clientId)
        .then((wSocket) => wSocket.send({
            action: DeviceHiveUtils.getTopicSubscribeRequestAction(topic),
            networkIds: topicStructure.getNetwork(),
            deviceIds: topicStructure.getDevice(),
            names: topicStructure.getName()
        }));
}

/**
 *
 * @param clientId
 * @param topic
 * @param subscriptionId
 * @returns {Promise.<Object>}
 */
function unsubscribe (clientId, topic, subscriptionId) {
    return wsFactory.getSocket(clientId)
        .then((wSocket) => wSocket.send({
            action: DeviceHiveUtils.getTopicUnsubscribeRequestAction(topic),
            subscriptionId: subscriptionId
        }));
}

/**
 *
 * @param clientId
 * @param topic
 */
function unsubscribeFromLessGlobalTopics (clientId, topic) {
    subscriptionManager.getSubjects(clientId)
        .filter((subscription) => DeviceHiveUtils.isMoreGlobalTopic(topic, subscription))
        .forEach((topicToUnsubscribe) => {
            let subscriptionId = subscriptionManager.findSubscriptionId(clientId, topicToUnsubscribe);

            if (subscriptionId) {
                unsubscribe(clientId, topicToUnsubscribe, subscriptionId)
                    .then(() => subscriptionManager.removeSubjectSubscriber(topicToUnsubscribe, clientId))
                    .catch((err) => console.warn(err));
            }
        });
}

/**
 *
 * @param clientId
 * @param topic
 * @returns {boolean}
 */
function isSubscriptionActual (clientId, topic) {
    return subscriptionManager.hasSubscriptionAttempt(clientId, topic);
}

/**
 *
 * @param clientId
 * @param topic
 */
function subscribeToNextMostGlobalTopic (clientId, topic) {
    let subscriberSubscriptions = subscriptionManager.getSubscriptionAttempts(clientId);
    let nextMostGlobalTopic = subscriberSubscriptions
        .filter((existingSubject) => DeviceHiveUtils.isLessGlobalTopic(existingSubject, topic))
        .sort((subject1, subject2) => !DeviceHiveUtils.isMoreGlobalTopic(subject1, subject2))[0];

    if (nextMostGlobalTopic) {
        subscribe(clientId, nextMostGlobalTopic)
            .then((subscriptionResponse) => subscriptionManager.addSubjectSubscriber(
                nextMostGlobalTopic, clientId, subscriptionResponse.subscriptionId))
            .catch((err) => console.warn(err));
    }
}

// TODO move it
function transformNotificationDataToTopic (data) {
    let action = data.action === "notification/insert" ? "notification" : "command";
    let network = "+";
    let device = data.notification.deviceId;
    let name = data.notification.notification;

    return ['dh', action, network, device, name].join("/");
}