const CONST = require('../util/constants.json');
const LRU = require("lru-cache");
const cache = new LRU({
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
    constructor(topic = ``) {
        const me = this;

        me.response = false;
        me.request = false;
        me.domain = ``;
        me.action = ``;
        me.network = ``;
        me.device = ``;
        me.name = ``;
        me.owner = ``;

        if (cache.has(topic)) {
            Object.assign(me, cache.get(topic));
        } else {
            if (topic && topic.startsWith(`${CONST.TOPICS.PARTS.DH}/`)) {
                const [topicBody, owner] = topic.split(CONST.CLIENT_ID_TOPIC_SPLITTER);
                const partedTopicBody = topicBody.split(`/`);

                me.owner = owner;
                me.response = partedTopicBody[1] === CONST.TOPICS.PARTS.RESPONSE;
                me.request = partedTopicBody[1] === CONST.TOPICS.PARTS.REQUEST;

                const shift = me.response || me.request ? 1 : 0;
                const network = partedTopicBody[2 + shift];
                const device = partedTopicBody[3 + shift];
                let name = partedTopicBody[4 + shift];

                name = (me.hasOwner() && name) ? name.split(CONST.CLIENT_ID_TOPIC_SPLITTER)[0] : name;

                me.domain = partedTopicBody[0];
                me.action = partedTopicBody[1 + shift];
                me.network = (!network || CONST.MQTT.WILDCARDS.includes(network)) ? `` : network;
                me.device = (!device || CONST.MQTT.WILDCARDS.includes(device)) ? `` : device;
                me.name = (!name || CONST.MQTT.WILDCARDS.includes(name)) ? `` : name;

                cache.set(topic, me);
            }
        }
    }

    /**
     * Get topic domain
     * @returns {*}
     */
    getDomain () {
        const me = this;

        return me.domain;
    }

    /**
     * Check that topic has owner
     * @return {boolean}
     */
    hasOwner () {
        const me = this;

        return !!me.owner;
    }

    /**
     * Get topic owner
     * @return {String|*}
     */
    getOwner () {
        const me = this;

        return me.owner;
    }

    /**
     * Is subscription topic
     */
    isSubscription () {
        const me = this;

        return !me.response && !me.request;
    }

    /**
     * Is response topic
     * @returns {boolean}
     */
    isResponse () {
        const me = this;

        return me.response;
    }

    /**
     * Is request topic
     * @returns {boolean}
     */
    isRequest () {
        const me = this;

        return me.request;
    }

    /**
     * Get topic action
     * @returns {*}
     */
    getAction () {
        const me = this;

        return me.action;
    }

    /**
     * Get topic network
     * @returns {*}
     */
    getNetwork () {
        const me = this;

        return me.network;
    }

    /**
     * Get topic device
     * @returns {*}
     */
    getDevice () {
        const me = this;

        return me.device;
    }

    /**
     * Get topic Name
     * @returns {*}
     */
    getName () {
        const me = this;

        return me.name;
    }

    /**
     * Is DeviceHive topic
     * @returns {boolean}
     */
    isDH () {
        const me = this;

        return me.domain === CONST.TOPICS.PARTS.DH;
    }

    /**
     * Is notification topic
     * @returns {boolean}
     */
    isNotification () {
        const me = this;

        return me.action === CONST.TOPICS.PARTS.NOTIFICATION;
    }

    /**
     * Is command topic
     * @returns {boolean}
     */
    isCommandInsert () {
        const me = this;

        return me.action === CONST.TOPICS.PARTS.COMMAND;
    }

    /**
     * Is command with update topic
     * @returns {boolean}
     */
    isCommandUpdate () {
        const me = this;

        return me.action === CONST.TOPICS.PARTS.COMMAND_UPDATE;
    }

    /**
     * TODO rework
     * Convert data object to topic
     * @param dataObject
     * @param owner
     * @returns {string}
     */
    static toTopicString (dataObject, owner) {
        let topicParts = [];

        if (dataObject.subscriptionId) {
            const action = dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT ?
                CONST.TOPICS.PARTS.NOTIFICATION :
                (dataObject.action === CONST.WS.ACTIONS.COMMAND_INSERT ?
                    CONST.TOPICS.PARTS.COMMAND :
                    CONST.TOPICS.PARTS.COMMAND_UPDATE);
            const propertyKey = dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT ?
                CONST.TOPICS.PARTS.NOTIFICATION :
                CONST.TOPICS.PARTS.COMMAND;
            const network = dataObject[propertyKey].networkId;
            const device = dataObject[propertyKey].deviceId;
            const name = dataObject[propertyKey][propertyKey];

            topicParts = [CONST.TOPICS.PARTS.DH, action, network, device, name];
        } else {
            const action = dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT ?
                CONST.TOPICS.PARTS.NOTIFICATION :
                (dataObject.action === CONST.WS.ACTIONS.COMMAND_INSERT ?
                    CONST.TOPICS.PARTS.COMMAND :
                    (dataObject.action === CONST.WS.ACTIONS.COMMAND_UPDATE ?
                        CONST.TOPICS.PARTS.COMMAND_UPDATE :
                        dataObject.action));

            topicParts = [CONST.TOPICS.PARTS.DH, CONST.TOPICS.PARTS.RESPONSE, action];
        }

        return !!owner ? topicParts.join("/") + CONST.CLIENT_ID_TOPIC_SPLITTER + owner : topicParts.join("/");
    }
}

module.exports = TopicStructure;