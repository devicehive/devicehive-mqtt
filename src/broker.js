const CONST = require('../util/constants.json');
const mosca = require('mosca');
const WebSocketFactory = require('../lib/WebSocketFactory.js');
const util = require('util');

const IS_DEV = process.env.NODE_ENV === CONST.DEV;
const WS_SERVER_URL = IS_DEV ? CONST.WS.DEV_HOST : process.env.WS_SERVER_URL;
const FORBIDDEN_TO_SUBSCRIBE_TOPICS = [
    CONST.TOPICS.TOKEN,
    CONST.TOPICS.DH_AUTHENTICATION
];

let wsFactory = new WebSocketFactory(WS_SERVER_URL);
let server = new mosca.Server({
    port: CONST.MQTT.PORT,
    logger: {
        level: 'info'
    }
});

server.authenticate = function (client, username, password, callback) {
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
};

server.authorizeForward = function (client, packet, callback) {
    let topicOwner = getClientFromTopic(packet.topic);

    callback(null, topicOwner ? topicOwner === client.id : true);
};

server.authorizeSubscribe = function (client, topic, callback) {
    callback(null, !FORBIDDEN_TO_SUBSCRIBE_TOPICS.includes(topic));
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
                    .then((wSocket) => wSocket.send(JSON.parse(packet.payload.toString())))
                    .then((data) => server.publish({
                        topic: getClientTopic(packet.topic, client),
                        payload: JSON.stringify(data)
                    }))
                    .catch((err) => console.warn(err));
                break;
        }
    }
});


/**
 * Append client id to topic base
 * @param topic
 * @param client
 * @returns {String}
 */
function getClientTopic (topic, client) {
    return util.format('%s%s%s', topic, CONST.CLIENT_ID_TOPIC_SPLITTER, client.id);
}

/**
 * Extract client id from client topic
 * @param topic
 * @returns {String}
 */
function getClientFromTopic (topic) {
    return topic.split(CONST.CLIENT_ID_TOPIC_SPLITTER)[1];
}
