const EventEmitter = require(`events`);
const SubscriptionEntry = require(`./SubscriptionEntry.js`);

/**
 * Subscription Manager class. Used to handle multiple subscription
 * @event message
 */
class SubscriptionManager extends EventEmitter {

    /**
     * Create Subscription Manager
     */
    constructor () {
        super();

        this.subscriptionAttemptsMap = new Map();
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
        const me = this;

        if (me.hasSubscription(subject)) {
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
        const me = this;

        if (me.hasSubscription(subject)) {
            const subscriptionEntry = me.subscriptionEntryMap.get(subject);

            subscriptionEntry.removeSubscriber(subscriber);

            if (subscriptionEntry.getSubscriptionCounter() === 0) {
                me.subscriptionEntryMap.delete(subject);
                me.subscriptionExecutorMap.delete(subject);
                me.subscriptionExecutCounterMap.delete(subject);
                me.subscriptionAttemptsMap.delete(subscriber);
            }
        }
    }

    /**
     * Check for subscription
     * @param subject
     * @returns {boolean}
     */
    hasSubscription (subject) {
        const me = this;

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
        const me = this;

        if (!me.subscriptionExecutorMap.has(subject)) {
            me.subscriptionExecutCounterMap.set(subject, 0);
            me.subscriptionExecutorMap.set(subject, function () {
                if (me.subscriptionEntryMap.has(subject)) {
                    const subscriptionEntry = me.subscriptionEntryMap.get(subject);

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
     * Get all subject of the subscriber
     * @param subscriber
     * @returns {Array}
     */
    getSubjects (subscriber) {
        const me = this;
        const subjects = [];

        me.subscriptionEntryMap.forEach((subscriptionEntry, subject) => {
            if (subscriptionEntry.hasSubscriber(subscriber)) {
                subjects.push(subject);
            }
        });

        return subjects;
    }

    /**
     * Get all subjects
     * @returns {Array}
     */
    getAllSubjects () {
        const me = this;
        const subjects = [];

        me.subscriptionEntryMap.forEach((subscriptionEntry, subject) => {
            subjects.push(subject);
        });

        return subjects;
    }

    /**
     * Find subject by subscriber and subscriptionId
     * @param subscriber
     * @param subscriptionId
     * @returns {string}
     */
    findSubject (subscriber, subscriptionId) {
        const me = this;
        let resultSubject = ``;

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
        const me = this;
        let resultSubscriptionId = ``;

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
        const me = this;

        return me.subscriptionEntryMap.get(subject).getSubscribers();
    }

    /**
     * Get subject execution counter
     * @returns {number}
     */
    getExecutionCounter (subject) {
        const me = this;

        return me.subscriptionExecutCounterMap.get(subject);
    }

    /**
     * Increment subject execution counter
     */
    incExecutionCounter (subject) {
        const me = this;
        const counter = me.subscriptionExecutCounterMap.get(subject);

        me.subscriptionExecutCounterMap.set(subject, counter + 1);
    }

    /**
     * Reset (set to 0) execution counter
     */
    resetExecutionCounter (subject) {
        const me = this;

        me.subscriptionExecutCounterMap.set(subject, 0);
    }

    /**
     * Add subscription attempt
     * @param subscriber
     * @param subject
     */
    addSubscriptionAttempt (subscriber, subject) {
        const me = this;

        if (me.subscriptionAttemptsMap.has(subscriber)) {
            me.subscriptionAttemptsMap.get(subscriber).add(subject);
        } else {
            me.subscriptionAttemptsMap.set(subscriber, (new Set()).add(subject));
        }
    }

    /**
     * Get all subscriber`s subscription attempts
     * @param subscriber
     * @returns {Array}
     */
    getSubscriptionAttempts (subscriber) {
        const me = this;
        let result = [];

        if (me.subscriptionAttemptsMap.has(subscriber)) {
            result = [...me.subscriptionAttemptsMap.get(subscriber)];
        }

        return result;
    }

    /**
     * Remove subscription attempt
     * @param subscriber
     * @param subject
     */
    removeSubscriptionAttempt (subscriber, subject) {
        const me = this;

        if (me.subscriptionAttemptsMap.has(subscriber)) {
            me.subscriptionAttemptsMap.get(subscriber).delete(subject);
        }
    }

    /**
     * Check for existing subscription attempt
     * @param subscriber
     * @param subject
     * @returns {boolean}
     */
    hasSubscriptionAttempt (subscriber, subject) {
        const me = this;
        let result = false;

        if (me.subscriptionAttemptsMap.has(subscriber)) {
            result = me.subscriptionAttemptsMap.get(subscriber).has(subject);
        }

        return result;
    }
}

module.exports = SubscriptionManager;