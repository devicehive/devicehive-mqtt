/**
 * SubscriptionEntry. Used with SubscriptionManager to manage
 * subscription on the same topic from multiple users
 */
class SubscriptionEntry {
    /**
     * Create Subscription Entry
     * @param {string} subscriber
     * @param {string} subscriptionId
     */
    constructor(subscriber, subscriptionId) {
        this.subscriptionIdMap = new Map();

        this.subscriptionIdMap.set(subscriber, subscriptionId);
        this.subscriptionCounter = 1;
    }

    /**
     * Get subscription counter
     * @return {number}
     */
    getSubscriptionCounter() {
        return this.subscriptionCounter;
    }

    /**
     * Add subscriber
     * @param {string} subscriber
     * @param {string} subscriptionId
     */
    addSubscriber(subscriber, subscriptionId) {
        this.subscriptionIdMap.set(subscriber, subscriptionId);
        this.subscriptionCounter++;
    }

    /**
     * Remove subscriber
     * @param {string} subscriber
     */
    removeSubscriber(subscriber) {
        this.subscriptionIdMap.delete(subscriber);
        this.subscriptionCounter--;
    }

    /**
     * Get subscriber by subscriptionId
     * @param {string} subscriptionId
     * @return {string}
     */
    getSubscriber(subscriptionId) {
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
     * @return {Array}
     */
    getSubscribers() {
        const subscribers = [];

        this.subscriptionIdMap.forEach((subscriptionIdItem, ownerItem) => {
            subscribers.push(ownerItem);
        });

        return subscribers;
    }

    /**
     * Get subscriptionId by subscriber
     * @param {string} subscriber
     * @return {string}
     */
    getSubscriptionId(subscriber) {
        return this.subscriptionIdMap.get(subscriber);
    }

    /**
     * Check for subscriber
     * @param {string} subscriber
     * @return {boolean}
     */
    hasSubscriber(subscriber) {
        return this.subscriptionIdMap.has(subscriber);
    }

    /**
     * check for subscriptionId
     * @param {string} subscriptionId
     * @return {boolean}
     */
    hasSubscriptionId(subscriptionId) {
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
