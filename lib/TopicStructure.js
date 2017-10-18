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
    isCommand () {
        const me = this;

        return me.action === `command`;
    }

    /**
     * TODO rework
     * Convert data object to topic
     * @param dataObject
     * @returns {string}
     */
    static toTopic (dataObject) {
        const action = dataObject.action === `notification/insert` ? `notification` : `command`;
        const network = `+`;
        const device = dataObject[action].deviceId;
        const name = dataObject[action][action];

        return [`dh`, action, network, device, name].join(`/`);
    }
}

module.exports = TopicStructure;