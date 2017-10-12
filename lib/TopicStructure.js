const CONST = require('../util/constants.json');

/**
 * TopicStructure class. Used to parse topic string
 */
class TopicStructure {

    /**
     * Create new topic structure
     * @param topic
     */
    constructor (topic) {
        let me = this;
        let splittedTopic = topic.split('/');


        if (splittedTopic[0] === 'dh') {
            let network = splittedTopic[2];
            let device = splittedTopic[3];
            let name = splittedTopic[4];

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
        let me = this;

        return me.domain;
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
     * @returns {string}
     */
    static toTopicString (dataObject) {
        let action = dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT ?
            CONST.TOPICS.PARTS.NOTIFICATION :
            (dataObject.action === CONST.WS.ACTIONS.COMMAND_INSERT ?
                CONST.TOPICS.PARTS.COMMAND :
                CONST.TOPICS.PARTS.COMMAND_UPDATE);
        let propertyKey = dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT ?
            CONST.TOPICS.PARTS.NOTIFICATION :
            CONST.TOPICS.PARTS.COMMAND;
        let network = CONST.MQTT.WILDCARDS[0];
        let device = dataObject[propertyKey].deviceId;
        let name = dataObject[propertyKey][propertyKey];

        return [CONST.TOPICS.PARTS.DH, action, network, device, name].join("/");
    }
}

module.exports = TopicStructure;