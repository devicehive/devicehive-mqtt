
/**
 * SubscriptionEntry. Used with SubscriptionManager to manage
 * subscription on the same topic from multiple users
 */
class SubscriptionEntry {

    /**
     * Create Subscription Entry
     * @param subscriber
     * @param subscriptionId
     */
    constructor (subscriber, subscriptionId) {
        let me = this;

        me.subscriptionIdMap = new Map();

        me.subscriptionIdMap.set(subscriber, subscriptionId);
        me.subscriptionCounter = 1;
    }

    /**
     * Get subscription counter
     * @returns {number}
     */
    getSubscriptionCounter () {
        let me = this;

        return me.subscriptionCounter;
    }

    /**
     * Add subscriber
     * @param subscriber
     * @param subscriptionId
     */
    addSubscriber (subscriber, subscriptionId) {
        let me = this;

        me.subscriptionIdMap.set(subscriber, subscriptionId);
        me.subscriptionCounter++;
    }

    /**
     * Remove subscriber
     * @param subscriber
     */
    removeSubscriber (subscriber) {
        let me = this;

        me.subscriptionIdMap.delete(subscriber);
        me.subscriptionCounter--;
    }

    /**
     * Get subscriber by subscriptionId
     * @param subscriptionId
     * @returns {string}
     */
    getSubscriber (subscriptionId) {
        let me = this;
        let resultOwner = '';

        me.subscriptionIdMap.forEach((subscriptionIdItem, ownerItem) => {
            if (subscriptionIdItem === subscriptionId) {
                resultOwner = ownerItem;
            }
        });

        return resultOwner;
    }

    /**
     * Get all subscribers
     * @returns {Array}
     */
    getSubscribers () {
        let me = this;
        let subscribers = [];

        me.subscriptionIdMap.forEach((subscriptionIdItem, ownerItem) => {
            subscribers.push(ownerItem);
        });

        return subscribers;
    }

    /**
     * Get subscriptionId by subscriber
     * @param subscriber
     * @returns {string}
     */
    getSubscriptionId (subscriber) {
        let me = this;

        return me.subscriptionIdMap.get(subscriber);
    }

    /**
     * Check for subscriber
     * @param subscriber
     * @returns {boolean}
     */
    hasSubscriber (subscriber) {
        let me = this;

        return me.subscriptionIdMap.has(subscriber);
    }

    /**
     * check for subscriptionId
     * @param subscriptionId
     * @returns {boolean}
     */
    hasSubscriptionId (subscriptionId) {
        let me = this;
        let result = false;

        me.subscriptionIdMap.forEach((subscriptionIdItem) => {
            if (subscriptionId === subscriptionIdItem) {
                result = true;
            }
        });

        return result;
    }
}

module.exports = SubscriptionEntry;