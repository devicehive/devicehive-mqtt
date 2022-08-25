const CONST = require("./constants.json");
const TopicStructure = require("../lib/TopicStructure.js");
const LRU = require("lru-cache");
const cache = new LRU({
    max: 10000,
    ttl: 1000 * 60 * 60,
});

/**
 * Generate the possible patterns that might match a topic.
 *
 * @param {string} topic
 * @return {Array} the list of the patterns
 */
function _topicPatterns(topic) {
    const parts = topic.split("/");
    const patterns = [topic];
    let i;
    const a = [];
    const b = [];
    let j;
    let k;
    let h;
    const list = [];

    for (j = 1; j < parts.length; j++) {
        list.length = 0; // clear the array

        for (i = 0; i < parts.length; i++) {
            a.length = 0;
            b.length = 0;

            list.push(i);
            for (h = 1; list.length < j; h++) {
                list.unshift(parts.length - h);
            }

            for (k = 0; k < parts.length; k++) {
                if (list.indexOf(k) >= 0) {
                    a.push(parts[k]);
                    b.push(parts[k]);
                } else {
                    if (k === 0 || a[a.length - 1] !== "#") {
                        a.push("#");
                    }
                    b.push("+");
                }
            }

            patterns.push(a.join("/"));
            patterns.push(b.join("/"));
            list.shift();
        }
    }

    return patterns;
}

/**
 * Generate the possible patterns that might match a topic.
 * Memozied version.
 *
 * @param {String} topic
 * @return {Array} the list of the patterns
 */
function topicPatterns(topic) {
    let result = cache.get(topic);
    if (!result) {
        result = _topicPatterns(topic);
    }
    cache.set(topic, result);
    return result;
}

/**
 * Device Hive Util class
 */
class DeviceHiveUtils {
    /**
     * Create subscription object based on topic parameter
     * @param {string} topic
     * @return {Object}
     */
    static createSubscriptionDataObject(topic) {
        const topicStructure = new TopicStructure(topic);
        const result = {};
        const action = DeviceHiveUtils.getTopicSubscribeRequestAction(topic);
        const networkIds = topicStructure.getNetworkIds();
        const deviceTypeIds = topicStructure.getDeviceTypeIds();
        const deviceId = topicStructure.getDevice();
        const names = topicStructure.getNames();

        if (action) {
            result.action = action;
        }
        if (networkIds) {
            result.networkIds = networkIds;
        }
        if (deviceTypeIds) {
            result.deviceTypeIds = deviceTypeIds;
        }
        if (deviceId) {
            result.deviceId = deviceId;
        }
        if (names) {
            result.names = names;
        }
        if (topicStructure.isCommandUpdate()) {
            result.returnUpdatedCommands = true;
        }

        return result;
    }

    /**
     * Check for same topic root
     * @param {string} topic1
     * @param {string} topic2
     * @return {boolean}
     */
    static isSameTopicRoot(topic1, topic2) {
        let result = true;
        const splittedTopic1 = topic1.split("/");
        const splittedTopic2 = topic2.split("/");
        const smallestSize =
            splittedTopic1.length < splittedTopic2.length
                ? splittedTopic1.length
                : splittedTopic2.length;

        for (let counter = 0; counter < smallestSize; counter++) {
            if (
                splittedTopic1[counter] !== splittedTopic2[counter] &&
                !(
                    CONST.MQTT.WILDCARDS.includes(splittedTopic1[counter]) ||
                    CONST.MQTT.WILDCARDS.includes(splittedTopic2[counter])
                )
            ) {
                result = false;
                break;
            }
        }

        return result;
    }

    /**
     * Check if the topicToCheck is less global than the topicToCompare
     * @param {string} topicToCheck
     * @param {string} topicToCompare
     * @return {boolean}
     */
    static isLessGlobalTopic(topicToCheck, topicToCompare) {
        let result = false;
        const topicToCheckPatterns = topicPatterns(topicToCheck);

        if (topicToCheckPatterns.includes(topicToCompare)) {
            result = true;
        }

        return result;
    }

    /**
     * Check if the topicToCheck is more global than the topicToCompare
     * @param {string} topicToCheck
     * @param {string} topicToCompare
     * @return {boolean}
     */
    static isMoreGlobalTopic(topicToCheck, topicToCompare) {
        let result = false;
        const topicToComparePatterns = topicPatterns(topicToCompare);

        if (topicToComparePatterns.includes(topicToCheck)) {
            result = true;
        }

        return result;
    }

    /**
     * Get WS action for topic subscription
     * @param {string} topic
     * @return {string}
     */
    static getTopicSubscribeRequestAction(topic) {
        let action = "";
        const topicStructure = new TopicStructure(topic);

        if (topicStructure.isSubscription()) {
            if (topicStructure.isNotification()) {
                action = CONST.WS.ACTIONS.NOTIFICATION_SUBSCRIBE;
            } else if (
                topicStructure.isCommandInsert() ||
                topicStructure.isCommandUpdate()
            ) {
                action = CONST.WS.ACTIONS.COMMAND_SUBSCRIBE;
            }
        }

        return action;
    }

    /**
     * Get WS action for topic unsubscription
     * @param {string} topic
     * @return {string}
     */
    static getTopicUnsubscribeRequestAction(topic) {
        let action = "";
        const topicStructure = new TopicStructure(topic);

        if (topicStructure.isSubscription()) {
            if (topicStructure.isNotification()) {
                action = CONST.WS.ACTIONS.NOTIFICATION_UNSUBSCRIBE;
            } else if (
                topicStructure.isCommandInsert() ||
                topicStructure.isCommandUpdate()
            ) {
                action = CONST.WS.ACTIONS.COMMAND_UNSUBSCRIBE;
            }
        }

        return action;
    }

    /**
     * Get WS response action for topic
     * @param {string} topic
     * @return {string}
     */
    static getTopicSubscriptionResponseAction(topic) {
        let action = "";
        const topicStructure = new TopicStructure(topic);

        if (topicStructure.isSubscription()) {
            if (topicStructure.isNotification()) {
                action = CONST.WS.ACTIONS.NOTIFICATION_INSERT;
            } else if (topicStructure.isCommandUpdate()) {
                action = CONST.WS.ACTIONS.COMMAND_UPDATE;
            } else if (topicStructure.isCommandInsert()) {
                action = CONST.WS.ACTIONS.COMMAND_INSERT;
            }
        }

        return action;
    }
}

module.exports = DeviceHiveUtils;
