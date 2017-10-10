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
let server = new mosca.Server({
    port: CONST.MQTT.PORT,
    // logger: {
    //     level: 'info'
    // }
});


wsFactory.on('globalMessage', (message, clientId) => {
    let data = JSON.parse(message.data);
    let topic = subscriptionManager.findSubject(clientId, data.subscriptionId);
    let topicStructure = new TopicStructure(topic);

    if (data.action === DeviceHiveUtils.getTopicResponseAction(topicStructure)) {
        (subscriptionManager.getSubscriptionExecutor(topic, () => {
            server.publish({
                topic: topic,
                payload: message.data
            });
        }))();
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
    // let hasSubscription = subscriptionManager.hasSubscription(packet.topic);
    // let isTopicSubscriber = subscriptionManager.getSubscribers(packet.topic).includes(client.id);

    callback(null, topicOwner ? topicOwner === client.id : true);
    //callback(null, topicOwner ? topicOwner === client.id : (hasSubscription ? isTopicSubscriber : true));
};

server.authorizeSubscribe = function (client, topic, callback) {
    if (FORBIDDEN_TO_SUBSCRIBE_TOPICS.includes(topic)) {
        callback(null, false);
        return;
    }

    let topicStructure = new TopicStructure(topic);

    if (topicStructure.isDH()) {
        wsFactory.getSocket(client.id)
            .then((wSocket) => wSocket.send({
                action: DeviceHiveUtils.getTopicSubscribeRequestAction(topicStructure),
                networkIds: topicStructure.getNetwork(),
                deviceIds: topicStructure.getDevice(),
                names: topicStructure.getName()
            }))
            .then((subscriptionResponse) => {
                if (subscriptionResponse.status === 'success') {
                    subscriptionManager.addSubjectSubscriber(topic, client.id, subscriptionResponse.subscriptionId);
                    callback(null, true);
                } else {
                    callback(null, false);
                }
            })
            .catch(() => {
                callback(null, false);
            });
    }
};

server.on('ready', () => {
    console.log('MQTT Broker has been started');
});

server.on('clientDisconnected', (client) => {
    wsFactory.removeSocket(client.id);
});

server.on('published', (packet, client) => {
    if (client) {
        switch (packet.topic) {
            case CONST.TOPICS.TOKEN:
            case CONST.TOPICS.DH_AUTHENTICATION:
                wsFactory.getSocket(client.id)
                    .then((wSocket) => wSocket.send(JSON.parse(packet.payload.toString()))) // TODO
                    .then((data) => server.publish({
                        topic: DeviceHiveUtils.getClientTopic(packet.topic, client),
                        payload: JSON.stringify(data)
                    }))
                    .catch((err) => console.warn(err));
                break;
        }
    }
});

server.on('unsubscribed', (topic, client) => {
    let topicStructure = new TopicStructure(topic);

    if (topicStructure.isDH()) {
        let subscriptionId = subscriptionManager.findSubscriptionId(client.id, topic);

        wsFactory.getSocket(client.id)
            .then((wSocket) => wSocket.send({
                action: DeviceHiveUtils.getTopicUnsubscribeRequestAction(topicStructure),
                subscriptionId: subscriptionId
            }))
            .then((unsubscriptionResponse) => {
                if (unsubscriptionResponse.status === 'success') {
                    subscriptionManager.removeSubjectSubscriber(topic, client.id);
                }
            })
            .catch((err) => {
                console.warn(err);
            });
    }
});

