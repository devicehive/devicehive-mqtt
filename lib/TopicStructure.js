const CONST = require("../util/constants.json");
const LRU = require("lru-cache");
const cache = new LRU({
    max: 10000,
    ttl: 1000 * 60 * 60,
});

/**
 * TopicStructure class. Used to parse topic string
 */
class TopicStructure {
    /**
     * Create new topic structure
     * @param {string} topic
     */
    constructor(topic = ``) {
        this.response = false;
        this.request = false;
        this.domain = ``;
        this.action = ``;
        this.network = ``;
        this.deviceType = ``;
        this.device = ``;
        this.name = ``;
        this.owner = ``;

        if (cache.has(topic)) {
            Object.assign(this, cache.get(topic));
        } else {
            if (topic && topic.startsWith(`${CONST.TOPICS.PARTS.DH}/`)) {
                const [topicBody, owner] = topic.split(
                    CONST.CLIENT_ID_TOPIC_SPLITTER
                );
                const partedTopicBody = topicBody.split(`/`);

                this.owner = owner;
                this.response =
                    partedTopicBody[1] === CONST.TOPICS.PARTS.RESPONSE;
                this.request =
                    partedTopicBody[1] === CONST.TOPICS.PARTS.REQUEST;

                const shift = this.response || this.request ? 1 : 0;
                const network = partedTopicBody[2 + shift];
                const deviceType = partedTopicBody[3 + shift];
                const device = partedTopicBody[4 + shift];
                let name = partedTopicBody[5 + shift];

                name =
                    this.hasOwner() && name
                        ? name.split(CONST.CLIENT_ID_TOPIC_SPLITTER)[0]
                        : name;

                this.domain = partedTopicBody[0];
                this.action = partedTopicBody[1 + shift];
                this.network =
                    !network || CONST.MQTT.WILDCARDS.includes(network)
                        ? ``
                        : network;
                this.deviceType =
                    !deviceType || CONST.MQTT.WILDCARDS.includes(deviceType)
                        ? ``
                        : deviceType;
                this.device =
                    !device || CONST.MQTT.WILDCARDS.includes(device)
                        ? ``
                        : device;
                this.name =
                    !name || CONST.MQTT.WILDCARDS.includes(name) ? `` : name;

                cache.set(topic, this);
            }
        }
    }

    /**
     * Get topic domain
     * @return {string}
     */
    getDomain() {
        return this.domain;
    }

    /**
     * Check that topic has owner
     * @return {boolean}
     */
    hasOwner() {
        return !!this.owner;
    }

    /**
     * Get topic owner
     * @return {string}
     */
    getOwner() {
        return this.owner;
    }

    /**
     * Is subscription topic
     * @return {boolean}
     */
    isSubscription() {
        return !this.response && !this.request;
    }

    /**
     * Is response topic
     * @return {boolean}
     */
    isResponse() {
        return this.response;
    }

    /**
     * Is request topic
     * @return {boolean}
     */
    isRequest() {
        return this.request;
    }

    /**
     * Get topic action
     * @return {string}
     */
    getAction() {
        return this.action;
    }

    /**
     * Get topic network
     * @return {Array}
     */
    getNetworkIds() {
        return !this.device && this.network ? [this.network] : undefined;
    }

    /**
     * Get topic device type
     * @return {Array}
     */
    getDeviceTypeIds() {
        return !this.device && this.deviceType ? [this.deviceType] : undefined;
    }

    /**
     * Get topic device
     * @return {string}
     */
    getDevice() {
        return this.device || undefined;
    }

    /**
     * Get topic Name
     * @return {Array}
     */
    getNames() {
        return this.name ? [this.name] : undefined;
    }

    /**
     * Is DeviceHive topic
     * @return {boolean}
     */
    isDH() {
        return this.domain === CONST.TOPICS.PARTS.DH;
    }

    /**
     * Is notification topic
     * @return {boolean}
     */
    isNotification() {
        return this.action === CONST.TOPICS.PARTS.NOTIFICATION;
    }

    /**
     * Is command topic
     * @return {boolean}
     */
    isCommandInsert() {
        return this.action === CONST.TOPICS.PARTS.COMMAND;
    }

    /**
     * Is command with update topic
     * @return {boolean}
     */
    isCommandUpdate() {
        return this.action === CONST.TOPICS.PARTS.COMMAND_UPDATE;
    }

    /**
     * TODO rework
     * Convert data object to topic
     * @param {Object} dataObject
     * @param {string} owner
     * @return {string}
     */
    static toTopicString(dataObject, owner = "") {
        let topicParts;

        if (dataObject.subscriptionId) {
            const action =
                dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT
                    ? CONST.TOPICS.PARTS.NOTIFICATION
                    : dataObject.action === CONST.WS.ACTIONS.COMMAND_INSERT
                    ? CONST.TOPICS.PARTS.COMMAND
                    : CONST.TOPICS.PARTS.COMMAND_UPDATE;
            const propertyKey =
                dataObject.action === CONST.WS.ACTIONS.NOTIFICATION_INSERT
                    ? CONST.TOPICS.PARTS.NOTIFICATION
                    : CONST.TOPICS.PARTS.COMMAND;
            const network = dataObject[propertyKey].networkId;
            const deviceType = dataObject[propertyKey].deviceTypeId;
            const device = dataObject[propertyKey].deviceId;
            const name = dataObject[propertyKey][propertyKey];

            topicParts = [
                CONST.TOPICS.PARTS.DH,
                action,
                network,
                deviceType,
                device,
                name,
            ];
        } else {
            topicParts = [
                CONST.TOPICS.PARTS.DH,
                CONST.TOPICS.PARTS.RESPONSE,
                dataObject.action,
            ];
        }

        return owner
            ? `${topicParts.join("/")}${CONST.CLIENT_ID_TOPIC_SPLITTER}${owner}`
            : topicParts.join("/");
    }
}

module.exports = TopicStructure;
