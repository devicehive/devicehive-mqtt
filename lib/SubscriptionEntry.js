
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
        this.subscriptionIdMap = new Map();

        this.subscriptionIdMap.set(subscriber, subscriptionId);
        this.subscriptionCounter = 1;
    }

    /**
     * Get subscription counter
     * @returns {number}
     */
    getSubscriptionCounter () {
        return this.subscriptionCounter;
    }

    /**
     * Add subscriber
     * @param subscriber
     * @param subscriptionId
     */
    addSubscriber (subscriber, subscriptionId) {
        this.subscriptionIdMap.set(subscriber, subscriptionId);
        this.subscriptionCounter++;
    }

    /**
     * Remove subscriber
     * @param subscriber
     */
    removeSubscriber (subscriber) {
        this.subscriptionIdMap.delete(subscriber);
        this.subscriptionCounter--;
    }

    /**
     * Get subscriber by subscriptionId
     * @param subscriptionId
     * @returns {string}
     */
    getSubscriber (subscriptionId) {
        let resultOwner = ``;

        this.subscriptionIdMap.forEach((subscriptionIdItem, ownerItem) => {
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
        const subscribers = [];

        this.subscriptionIdMap.forEach((subscriptionIdItem, ownerItem) => {
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
        return this.subscriptionIdMap.get(subscriber);
    }

    /**
     * Check for subscriber
     * @param subscriber
     * @returns {boolean}
     */
    hasSubscriber (subscriber) {
        return this.subscriptionIdMap.has(subscriber);
    }

    /**
     * check for subscriptionId
     * @param subscriptionId
     * @returns {boolean}
     */
    hasSubscriptionId (subscriptionId) {
        let result = false;

        this.subscriptionIdMap.forEach((subscriptionIdItem) => {
            if (subscriptionId === subscriptionIdItem) {
                result = true;
            }
        });

        return result;
    }
}

module.exports = SubscriptionEntry;
