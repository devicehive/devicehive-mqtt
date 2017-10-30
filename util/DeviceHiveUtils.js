const CONST = require('./constants.json');
const moscaUtils = require('../node_modules/mosca/lib/persistence/utils.js');
const TopicStructure = require('../lib/TopicStructure.js');

/**
 * Device Hive Util class
 */
class DeviceHiveUtils {

    /**
     * Create subscription object based on topic parameter
     * @param topic
     * @returns {Object}
     */
    static createSubscriptionDataObject (topic) {
        const topicStructure = new TopicStructure(topic);
        const result = {
            action: DeviceHiveUtils.getTopicSubscribeRequestAction(topic),
            networkIds: topicStructure.getDevice().length > 0 ? [] : [topicStructure.getNetwork()],
            deviceIds: topicStructure.getDevice() ? [topicStructure.getDevice()] : [],
            names: topicStructure.getName() ? [topicStructure.getName()] : []
        };

        if (topicStructure.isCommandUpdate()) {
            result.returnUpdatedCommands = true
        }

        return result;
    }

    /**
     * Check for same topic root
     * @param topic1
     * @param topic2
     * @returns {boolean}
     */
    static isSameTopicRoot (topic1, topic2) {
        let result = true;
        const splittedTopic1 = topic1.split('/');
        const splittedTopic2 = topic2.split('/');
        const smallestSize = splittedTopic1.length < splittedTopic2.length ?
            splittedTopic1.length :
            splittedTopic2.length;

        for (let counter = 0; counter < smallestSize; counter++) {
            if (splittedTopic1[counter] !== splittedTopic2[counter] &&
                !(CONST.MQTT.WILDCARDS.includes(splittedTopic1[counter]) ||
                CONST.MQTT.WILDCARDS.includes(splittedTopic2[counter]))) {
                result = false;
                break;
            }
        }

        return result;
    }

    /**
     * Check if the topicToCheck is less global than the topicToCompare
     * @param topicToCheck
     * @param topicToCompare
     * @returns {boolean}
     */
    static isLessGlobalTopic (topicToCheck, topicToCompare) {
        let result = false;
        const topicToCheckPatterns = moscaUtils.topicPatterns(topicToCheck);

        if (topicToCheckPatterns.includes(topicToCompare)) {
            result = true;
        }

        return result;
    }

    /**
     * Check if the topicToCheck is more global than the topicToCompare
     * @param topicToCheck
     * @param topicToCompare
     * @returns {boolean}
     */
    static isMoreGlobalTopic (topicToCheck, topicToCompare) {
        let result = false;
        const topicToComparePatterns = moscaUtils.topicPatterns(topicToCompare);

        if (topicToComparePatterns.includes(topicToCheck)) {
            result = true;
        }

        return result;
    }

    /**
     * Get WS action for topic subscription
     * @param topic
     * @returns {string}
     */
    static getTopicSubscribeRequestAction (topic) {
        let action = '';
        const topicStructure = new TopicStructure(topic);

        if (topicStructure.isSubscription()) {
            if (topicStructure.isNotification()) {
                action = CONST.WS.ACTIONS.NOTIFICATION_SUBSCRIBE;
            } else if (topicStructure.isCommandInsert() || topicStructure.isCommandUpdate()) {
                action = CONST.WS.ACTIONS.COMMAND_SUBSCRIBE;
            }
        }

        return action;
    }

    /**
     * Get WS action for topic unsubscription
     * @param topic
     * @returns {string}
     */
    static getTopicUnsubscribeRequestAction (topic) {
        let action = '';
        const topicStructure = new TopicStructure(topic);

        if (topicStructure.isSubscription()) {
            if (topicStructure.isNotification()) {
                action = CONST.WS.ACTIONS.NOTIFICATION_UNSUBSCRIBE;
            } else if (topicStructure.isCommandInsert() || topicStructure.isCommandUpdate()) {
                action = CONST.WS.ACTIONS.COMMAND_UNSUBSCRIBE;
            }
        }

        return action;
    }

    /**
     * Get WS response action for topic
     * @param topic
     * @returns {string}
     */
    static getTopicSubscriptionResponseAction (topic) {
        let action = '';
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