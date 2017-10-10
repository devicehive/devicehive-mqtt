const EventEmitter = require('events');
const SubscriptionEntry = require('./SubscriptionEntry.js');

/**
 * Subscription Manager class. Used to handle multiple subscription
 */
class SubscriptionManager extends EventEmitter {

    /**
     * Create Subscription Manager
     */
    constructor () {
        super();

        this.subscriptionEntryMap = new Map();
        this.subscriptionExecutorMap = new Map();
        this.subscriptionExecutCounterMap = new Map();
    }

    /**
     * Add subject subscriber
     * @param subject
     * @param subscriber
     * @param subscriptionId
     */
    addSubjectSubscriber (subject, subscriber, subscriptionId) {
        let me = this;

        if (me.subscriptionEntryMap.has(subject)) {
            me.subscriptionEntryMap.get(subject).addSubscriber(subscriber, subscriptionId);
        } else {
            me.subscriptionEntryMap.set(subject, new SubscriptionEntry(subscriber, subscriptionId));
        }
    }

    /**
     * Remove subject subscriber
     * @param subject
     * @param subscriber
     */
    removeSubjectSubscriber (subject, subscriber) {
        let me = this;

        if (me.subscriptionEntryMap.has(subject)) {
            let subscriptionEntry = me.subscriptionEntryMap.get(subject);

            subscriptionEntry.removeSubscriber(subscriber);

            if (subscriptionEntry.getSubscriptionCounter() === 0) {
                me.subscriptionEntryMap.delete(subject);
                me.subscriptionExecutorMap.delete(subject);
                me.subscriptionExecutCounterMap.delete(subject);
                me.emit('unsubscribed');
            }
        }
    }

    /**
     * Check for subscription
     * @param subject
     * @returns {boolean}
     */
    hasSubscription (subject) {
        let me = this;

        return me.subscriptionEntryMap.has(subject);
    }

    /**
     * Get or create new subscription executor that will execute
     * the execFunc only once for all subject subscriptions
     * @param subject
     * @param execFunc
     * @returns {Function}
     */
    getSubscriptionExecutor (subject, execFunc) {
        let me = this;

        if (!me.subscriptionExecutorMap.has(subject)) {
            me.subscriptionExecutCounterMap.set(subject, 0);
            me.subscriptionExecutorMap.set(subject, function () {
                if (me.subscriptionEntryMap.has(subject)) {
                    let subscriptionEntry = me.subscriptionEntryMap.get(subject);

                    if (me.getExecutionCounter(subject) === 0) {
                        execFunc.apply(this, arguments);
                    }

                    me.incExecutionCounter(subject);

                    if (me.getExecutionCounter(subject) === subscriptionEntry.getSubscriptionCounter()) {
                        me.resetExecutionCounter(subject);
                        me.subscriptionExecutorMap.delete(subject);
                    }
                }
            });
        }

        return me.subscriptionExecutorMap.get(subject)
    }

    /**
     * Find subject by subscriber and subscriptionId
     * @param subscriber
     * @param subscriptionId
     * @returns {string}
     */
    findSubject (subscriber, subscriptionId) {
        let me = this;
        let resultSubject = '';

        me.subscriptionEntryMap.forEach((subscriptionEntry, subject) => {
            if (subscriptionEntry.hasSubscriber(subscriber) && subscriptionEntry.hasSubscriptionId(subscriptionId)) {
                resultSubject = subject
            }
        });

        return resultSubject;
    }

    /**
     * Find subscriptionId by subscriber and subject
     * @param subscriber
     * @param subject
     * @returns {string}
     */
    findSubscriptionId (subscriber, subject) {
        let me = this;
        let resultSubscriptionId = '';

        if (me.subscriptionEntryMap.has(subject)) {
            resultSubscriptionId = me.subscriptionEntryMap.get(subject).getSubscriptionId(subscriber);
        }

        return resultSubscriptionId;
    }

    /**
     * Get all subject subscribers
     * @param subject
     * @returns {Array}
     */
    getSubscribers (subject) {
        let me = this;

        return me.subscriptionEntryMap.get(subject).getSubscribers();
    }

    /**
     * Get subject execution counter
     * @returns {number}
     */
    getExecutionCounter (subject) {
        let me = this;

        return me.subscriptionExecutCounterMap.get(subject);
    }

    /**
     * Increment subject execution counter
     */
    incExecutionCounter (subject) {
        let me = this;
        let counter = me.subscriptionExecutCounterMap.get(subject);

        me.subscriptionExecutCounterMap.set(subject, counter + 1);
    }

    /**
     * Reset (set to 0) execution counter
     */
    resetExecutionCounter (subject) {
        let me = this;

        me.subscriptionExecutCounterMap.set(subject, 0);
    }
}

module.exports = SubscriptionManager;