const EventEmitter = require(`events`);
const debug = require(`debug`)(`subscriptionmanager`);
const SubscriptionEntry = require(`./SubscriptionEntry.js`);

/**
 * Subscription Manager class. Used to handle multiple subscription
 * @event message
 */
class SubscriptionManager extends EventEmitter {
    /**
     * Create Subscription Manager
     */
    constructor() {
        super();

        this.subscriptionAttemptsMap = new Map();
        this.subscriptionEntryMap = new Map();
        this.subscriptionExecutorMap = new Map();
        this.subscriptionExecutCounterMap = new Map();

        debug(`${this.constructor.name}`);
    }

    /**
     * Add subject subscriber
     * @param {string} subject
     * @param {string} subscriber
     * @param {string} subscriptionId
     */
    addSubjectSubscriber(subject, subscriber, subscriptionId) {
        debug(
            `${this.addSubjectSubscriber.name}: ${subject} ${subscriber}, ${subscriptionId}`
        );

        if (this.hasSubscription(subject)) {
            this.subscriptionEntryMap
                .get(subject)
                .addSubscriber(subscriber, subscriptionId);
        } else {
            this.subscriptionEntryMap.set(
                subject,
                new SubscriptionEntry(subscriber, subscriptionId)
            );
        }
    }

    /**
     * Remove subject subscriber
     * @param {string} subject
     * @param {string} subscriber
     */
    removeSubjectSubscriber(subject, subscriber) {
        debug(`${this.removeSubjectSubscriber.name}: ${subject} ${subscriber}`);

        if (this.hasSubscription(subject)) {
            const subscriptionEntry = this.subscriptionEntryMap.get(subject);

            subscriptionEntry.removeSubscriber(subscriber);

            if (subscriptionEntry.getSubscriptionCounter() === 0) {
                this.subscriptionEntryMap.delete(subject);
                this.subscriptionExecutorMap.delete(subject);
                this.subscriptionExecutCounterMap.delete(subject);
                this.subscriptionAttemptsMap.delete(subscriber);
            }
        }
    }

    /**
     * Check for subscription
     * @param {string} subject
     * @return {boolean}
     */
    hasSubscription(subject) {
        return this.subscriptionEntryMap.has(subject);
    }

    /**
     * Get or create new subscription executor that will execute
     * the execFunc only once for all subject subscriptions
     * @param {string} subject
     * @param {Function} execFunc
     * @param {Array} rest
     * @return {Function}
     */
    getSubscriptionExecutor(subject, execFunc, ...rest) {
        if (!this.subscriptionExecutorMap.has(subject)) {
            this.subscriptionExecutCounterMap.set(subject, 0);
            this.subscriptionExecutorMap.set(subject, () => {
                if (this.subscriptionEntryMap.has(subject)) {
                    const subscriptionEntry =
                        this.subscriptionEntryMap.get(subject);

                    if (this.getExecutionCounter(subject) === 0) {
                        execFunc.apply(this, rest);
                    }

                    this.incExecutionCounter(subject);

                    if (
                        this.getExecutionCounter(subject) ===
                        subscriptionEntry.getSubscriptionCounter()
                    ) {
                        this.resetExecutionCounter(subject);
                        this.subscriptionExecutorMap.delete(subject);
                    }

                    debug(
                        `${
                            this.getSubscriptionExecutor.name
                        }: ${subject} ${subscriptionEntry.getSubscriptionCounter()} ${this.getExecutionCounter(
                            subject
                        )}`
                    );
                }
            });
        }

        return this.subscriptionExecutorMap.get(subject);
    }

    /**
     * Get all subject of the subscriber
     * @param {string} subscriber
     * @return {Array}
     */
    getSubjects(subscriber) {
        const subjects = [];

        this.subscriptionEntryMap.forEach((subscriptionEntry, subject) => {
            if (subscriptionEntry.hasSubscriber(subscriber)) {
                subjects.push(subject);
            }
        });

        return subjects;
    }

    /**
     * Get all subjects
     * @return {Array}
     */
    getAllSubjects() {
        const subjects = [];

        this.subscriptionEntryMap.forEach((subscriptionEntry, subject) => {
            subjects.push(subject);
        });

        return subjects;
    }

    /**
     * Find subject by subscriber and subscriptionId
     * @param {string} subscriber
     * @param {string} subscriptionId
     * @return {string}
     */
    findSubject(subscriber, subscriptionId) {
        let resultSubject = ``;

        this.subscriptionEntryMap.forEach((subscriptionEntry, subject) => {
            if (
                subscriptionEntry.hasSubscriber(subscriber) &&
                subscriptionEntry.hasSubscriptionId(subscriptionId)
            ) {
                resultSubject = subject;
            }
        });

        return resultSubject;
    }

    /**
     * Find subscriptionId by subscriber and subject
     * @param {string} subscriber
     * @param {string} subject
     * @return {string}
     */
    findSubscriptionId(subscriber, subject) {
        let resultSubscriptionId = ``;

        if (this.subscriptionEntryMap.has(subject)) {
            resultSubscriptionId = this.subscriptionEntryMap
                .get(subject)
                .getSubscriptionId(subscriber);
        }

        return resultSubscriptionId;
    }

    /**
     * Get all subject subscribers
     * @param {string} subject
     * @return {Array}
     */
    getSubscribers(subject) {
        return this.subscriptionEntryMap.get(subject).getSubscribers();
    }

    /**
     * Get subject execution counter
     * @param {string} subject
     * @return {number}
     */
    getExecutionCounter(subject) {
        return this.subscriptionExecutCounterMap.get(subject);
    }

    /**
     * Increment subject execution counter
     * @param {string} subject
     */
    incExecutionCounter(subject) {
        const counter = this.subscriptionExecutCounterMap.get(subject);

        this.subscriptionExecutCounterMap.set(subject, counter + 1);
    }

    /**
     * Reset (set to 0) execution counter
     * @param {string} subject
     */
    resetExecutionCounter(subject) {
        this.subscriptionExecutCounterMap.set(subject, 0);
    }

    /**
     * Add subscription attempt
     * @param {string} subscriber
     * @param {string} subject
     */
    addSubscriptionAttempt(subscriber, subject) {
        debug(`${this.addSubscriptionAttempt.name}: ${subject} ${subscriber}`);

        if (this.subscriptionAttemptsMap.has(subscriber)) {
            this.subscriptionAttemptsMap.get(subscriber).add(subject);
        } else {
            this.subscriptionAttemptsMap.set(
                subscriber,
                new Set().add(subject)
            );
        }
    }

    /**
     * Get all subscriber`s subscription attempts
     * @param {string} subscriber
     * @return {Array}
     */
    getSubscriptionAttempts(subscriber) {
        let result = [];

        if (this.subscriptionAttemptsMap.has(subscriber)) {
            result = [...this.subscriptionAttemptsMap.get(subscriber)];
        }

        return result;
    }

    /**
     * Remove subscription attempt
     * @param {string} subscriber
     * @param {string} subject
     */
    removeSubscriptionAttempt(subscriber, subject) {
        debug(
            `${this.removeSubscriptionAttempt.name}: ${subject} ${subscriber}`
        );

        if (this.subscriptionAttemptsMap.has(subscriber)) {
            this.subscriptionAttemptsMap.get(subscriber).delete(subject);
        }
    }

    /**
     * Check for existing subscription attempt
     * @param {string} subscriber
     * @param {string} subject
     * @return {boolean}
     */
    hasSubscriptionAttempt(subscriber, subject) {
        let result = false;

        if (this.subscriptionAttemptsMap.has(subscriber)) {
            result = this.subscriptionAttemptsMap.get(subscriber).has(subject);
        }

        return result;
    }
}

module.exports = SubscriptionManager;
