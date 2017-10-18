const CONST = require('../util/constants.json');
let LRU = require("lru-cache");
let cache = LRU({
    max: 10000,
    maxAge: 1000 * 60 * 60
});


/**
 * TopicStructure class. Used to parse topic string
 */
class TopicStructure {

    /**
     * Create new topic structure
     * @param topic
     */
    constructor(topic) {
        let me = this;
        let splittedTopic = topic.split('/');

        if (splittedTopic[0] === CONST.TOPICS.PARTS.DH) {
            if (cache.has(topic)) {
                Object.assign(me, cache.get(topic));
            } else {
                me.owner = splittedTopic[splittedTopic.length - 1].split(CONST.CLIENT_ID_TOPIC_SPLITTER)[1];
                me.response = splittedTopic[1] === CONST.TOPICS.PARTS.RESPONSE;
                me.request = splittedTopic[1] === CONST.TOPICS.PARTS.REQUEST;

                let shift = me.response || me.request ? 1 : 0;
                let network = splittedTopic[2 + shift];
                let device = splittedTopic[3 + shift];
                let name = splittedTopic[4 + shift];

                name = (me.hasOwner() && name) ? name.split(CONST.CLIENT_ID_TOPIC_SPLITTER)[0] : name;

                me.domain = splittedTopic[0];
                me.action = splittedTopic[1 + shift];
                me.network = (!network || CONST.MQTT.WILDCARDS.includes(network)) ? [] : [network];
                me.device = (!device || CONST.MQTT.WILDCARDS.includes(device)) ? [] : [device];
                me.name = (!name || CONST.MQTT.WILDCARDS.includes(name)) ? [] : [name];

                cache.set(topic, me);
            }
        }
    }

    /**
     * Get topic domain
     * @returns {*}
     */
    getDomain () {
        let me = this;

        return me.domain;
    }

    /**
     * Check that topic has owner
     * @return {boolean}
     */
    hasOwner () {
        let me = this;

        return !!me.owner;
    }

    /**
     * Get topic owner
     * @return {String|*}
     */
    getOwner () {
        let me = this;

        return me.owner;
    }

    /**
     * Is response topic
     * @returns {boolean}
     */
    isResponse () {
        let me = this;

        return me.response;
    }

    /**
     * Is request topic
     * @returns {boolean}
     */
    isRequest () {
        let me = this;

        return me.request;
    }

    /**
     * Get topic action
     * @returns {*}
     */
    getAction () {
        let me = this;

        return me.action;
    }

    /**
     * Get topic network
     * @returns {*}
     */
    getNetwork () {
        let me = this;

        return me.network;
    }

    /**
     * Get topic device
     * @returns {*}
     */
    getDevice () {
        let me = this;

        return me.device;
    }

    /**
     * Get topic Name
     * @returns {*}
     */
    getName () {
        let me = this;

        return me.name;
    }

    /**
     * Is DeviceHive topic
     * @returns {boolean}
     */
    isDH () {
        let me = this;

        return me.domain === 'dh';
    }

    /**
     * Is notification topic
     * @returns {boolean}
     */
    isNotification () {
        let me = this;

        return me.action === 'notification';
    }

    /**
     * Is command topic
     * @returns {boolean}
     */
    isCommandInsert () {
        let me = this;

        return me.action === 'command';
    }

    /**
     * Is command with update topic
     * @returns {boolean}
     */
    isCommandUpdate () {
        let me = this;

        return me.action === 'command_update';
    }

    /**
     * TODO rework
     * Convert data object to topic
     * @param dataObject
     * @param owner
     * @returns {string}
     */
    static toTopicString (dataObject, owner) {
        let result;
        let topicParts = [];

        if (dataObject.subscriptionId) {
            let action = dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT ?
                CONST.TOPICS.PARTS.NOTIFICATION :
                (dataObject.action === CONST.WS.ACTIONS.COMMAND_INSERT ?
                    CONST.TOPICS.PARTS.COMMAND :
                    CONST.TOPICS.PARTS.COMMAND_UPDATE);
            let propertyKey = dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT ?
                CONST.TOPICS.PARTS.NOTIFICATION :
                CONST.TOPICS.PARTS.COMMAND;
            let network = dataObject[propertyKey].networkId;
            let device = dataObject[propertyKey].deviceId;
            let name = dataObject[propertyKey][propertyKey];

            topicParts = [CONST.TOPICS.PARTS.DH, action, network, device, name];
        } else {
            let action = dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT ?
                CONST.TOPICS.PARTS.NOTIFICATION :
                (dataObject.action === CONST.WS.ACTIONS.COMMAND_INSERT ?
                    CONST.TOPICS.PARTS.COMMAND :
                    (dataObject.action === CONST.WS.ACTIONS.COMMAND_UPDATE ?
                        CONST.TOPICS.PARTS.COMMAND_UPDATE :
                        dataObject.action));

            topicParts = [CONST.TOPICS.PARTS.DH, CONST.TOPICS.PARTS.RESPONSE, action];
        }

        result = topicParts.join("/");

        return !!owner ? result + CONST.CLIENT_ID_TOPIC_SPLITTER + owner : result;
    }
}

module.exports = TopicStructure;