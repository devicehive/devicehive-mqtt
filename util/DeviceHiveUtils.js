const util = require('util');
const CONST = require('./constants.json');

/**
 * Device Hive Util class
 */
class DeviceHiveUtils {

    /**
     * Get WS action for topic subscription
     * @param topicStructure
     * @returns {string}
     */
    static getTopicSubscribeRequestAction (topicStructure) {
        let action = '';

        if (topicStructure.isNotification()) {
            action = CONST.WS.ACTIONS.NOTIFICATION_SUBSCRIBE;
        } else if (topicStructure.isCommand()) {
            action = CONST.WS.ACTIONS.COMMAND_SUBSCRIBE;
        }

        return action;
    }

    /**
     * Get WS action for topic unsubscription
     * @param topicStructure
     * @returns {string}
     */
    static getTopicUnsubscribeRequestAction (topicStructure) {
        let action = '';

        if (topicStructure.isNotification()) {
            action = CONST.WS.ACTIONS.NOTIFICATION_UNSUBSCRIBE;
        } else if (topicStructure.isCommand()) {
            action = CONST.WS.ACTIONS.COMMAND_UNSUBSCRIBE;
        }

        return action;
    }

    /**
     * Get WS response action for topic
     * @param topicStructure
     * @returns {string}
     */
    static getTopicResponseAction (topicStructure) {
        let action = '';

        if (topicStructure.isNotification()) {
            action = CONST.WS.ACTIONS.NOTIFICATION_INSERT;
        } else if (topicStructure.isCommand()) {
            action = CONST.WS.ACTIONS.COMMAND_INSERT;
        }

        return action;
    }

    /**
     * Append client id to topic base
     * @param topic
     * @param client
     * @returns {String}
     */
    static getClientTopic (topic, client) {
        return util.format('%s%s%s', topic, CONST.CLIENT_ID_TOPIC_SPLITTER, client.id);
    }

    /**
     * Extract client id from client topic
     * @param topic
     * @returns {String}
     */
    static getClientFromTopic (topic) {
        return topic.split(CONST.CLIENT_ID_TOPIC_SPLITTER)[1];
    }

}

module.exports = DeviceHiveUtils;