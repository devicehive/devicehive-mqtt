const CONST = require(`../util/constants.json`);

/**
 * TopicStructure class. Used to parse topic string
 */
class TopicStructure {

    /**
     * Create new topic structure
     * @param topic
     */
    constructor (topic) {
        const me = this;
        const splittedTopic = topic.split(`/`);


        if (splittedTopic[0] === `dh`) {
            const network = splittedTopic[2];
            const device = splittedTopic[3];
            const name = splittedTopic[4];

            me.domain = splittedTopic[0];
            me.action = splittedTopic[1];
            me.network = (!network || CONST.MQTT.WILDCARDS.includes(network)) ? [] : [network];
            me.device = (!device || CONST.MQTT.WILDCARDS.includes(device)) ? [] : [device];
            me.name = (!name || CONST.MQTT.WILDCARDS.includes(name)) ? [] : [name];
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

        return me.domain === `dh`;
    }

    /**
     * Is notification topic
     * @returns {boolean}
     */
    isNotification () {
        const me = this;

        return me.action === `notification`;
    }

    /**
     * Is command topic
     * @returns {boolean}
     */
    isCommandInsert () {
        const me = this;

        return me.action === `command`;
    }

    /**
     * Is command with update topic
     * @returns {boolean}
     */
    isCommandUpdate () {
        const me = this;

        return me.action === `command_update`;
    }

    /**
     * TODO rework
     * Convert data object to topic
     * @param dataObject
     * @returns {string}
     */
    static toTopicString (dataObject) {
        const action = dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT ?
            CONST.TOPICS.PARTS.NOTIFICATION :
            (dataObject.action === CONST.WS.ACTIONS.COMMAND_INSERT ?
                CONST.TOPICS.PARTS.COMMAND :
                CONST.TOPICS.PARTS.COMMAND_UPDATE);
        const propertyKey = dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT ?
            CONST.TOPICS.PARTS.NOTIFICATION :
            CONST.TOPICS.PARTS.COMMAND;
        const network = CONST.MQTT.WILDCARDS[0];
        const device = dataObject[propertyKey].deviceId;
        const name = dataObject[propertyKey][propertyKey];

        return [CONST.TOPICS.PARTS.DH, action, network, device, name].join(`/`);
    }
}

module.exports = TopicStructure;