const SubscriptionManager = require(`../../../lib/SubscriptionManager.js`);
const sinon = require(`sinon`);
const chai = require(`chai`);
const expect = chai.expect;

describe(SubscriptionManager.name, () => {
    const listOfMethods = [`addSubjectSubscriber`, `removeSubjectSubscriber`, `hasSubscription`,
        `getSubscriptionExecutor`, `getSubjects`, `getAllSubjects`, `findSubject`, `findSubscriptionId`,
        `getSubscribers`, `getExecutionCounter`, `incExecutionCounter`, `resetExecutionCounter`,
        `addSubscriptionAttempt`, `getSubscriptionAttempts`, `removeSubscriptionAttempt`, `hasSubscriptionAttempt`];
    const subscriber1 = `subscriber1`;
    const subscriber2 = `subscriber2`;
    const subscriber3 = `subscriber3`;
    const subject1 = `subject1`;
    const subject2 = `subject2`;
    const subject3 = `subject3`;
    const subject4 = `subject4`;
    const subscriptionId1 = `1`;
    const subscriptionId2 = `2`;
    const subscriptionId3 = `3`;
    const subscriptionId4 = `4`;
    const subscriptionId5 = `5`;
    const subscriptionId6 = `6`;


    it(`should be a class`, () => {
        expect(SubscriptionManager).to.be.a(`Function`);
    });

    it(`should has next methods: ${listOfMethods.join(`, `)}`, () => {
        listOfMethods.forEach((methodName) => {
            expect(new SubscriptionManager()[methodName]).to.be.a(`Function`);
        });
    });

    describe(`Basic functionality`, () => {
        it(`SubscriptionAttempt`, () => {
            const subscriptionManager = new SubscriptionManager();

            subscriptionManager.addSubscriptionAttempt(subscriber1, subject1);
            subscriptionManager.addSubscriptionAttempt(subscriber1, subject2);
            subscriptionManager.addSubscriptionAttempt(subscriber2, subject2);
            subscriptionManager.addSubscriptionAttempt(subscriber3, subject3);

            expect(subscriptionManager.hasSubscriptionAttempt(subscriber1, subject1)).to.equal(true);
            expect(subscriptionManager.hasSubscriptionAttempt(subscriber1, subject2)).to.equal(true);
            expect(subscriptionManager.hasSubscriptionAttempt(subscriber2, subject2)).to.equal(true);
            expect(subscriptionManager.hasSubscriptionAttempt(subscriber3, subject3)).to.equal(true);

            expect(subscriptionManager.getSubscriptionAttempts(subscriber1)).to.deep.equal([subject1, subject2]);
            expect(subscriptionManager.getSubscriptionAttempts(subscriber2)).to.deep.equal([subject2]);
            expect(subscriptionManager.getSubscriptionAttempts(subscriber3)).to.deep.equal([subject3]);

            subscriptionManager.removeSubscriptionAttempt(subscriber1, subject1);
            subscriptionManager.removeSubscriptionAttempt(subscriber1, subject2);
            subscriptionManager.removeSubscriptionAttempt(subscriber2, subject2);
            subscriptionManager.removeSubscriptionAttempt(subscriber3, subject3);

            expect(subscriptionManager.hasSubscriptionAttempt(subscriber1, subject1)).to.equal(false);
            expect(subscriptionManager.hasSubscriptionAttempt(subscriber1, subject2)).to.equal(false);
            expect(subscriptionManager.hasSubscriptionAttempt(subscriber2, subject2)).to.equal(false);
            expect(subscriptionManager.hasSubscriptionAttempt(subscriber3, subject3)).to.equal(false);
        });

        it(`Subscriptions`, () => {
            const subscriptionManager = new SubscriptionManager();

            subscriptionManager.addSubjectSubscriber(subject1, subscriber1, subscriptionId1);
            subscriptionManager.addSubjectSubscriber(subject2, subscriber1, subscriptionId2);
            subscriptionManager.addSubjectSubscriber(subject2, subscriber2, subscriptionId3);
            subscriptionManager.addSubjectSubscriber(subject3, subscriber3, subscriptionId4);
            subscriptionManager.addSubjectSubscriber(subject4, subscriber3, subscriptionId5);
            subscriptionManager.addSubjectSubscriber(subject1, subscriber3, subscriptionId6);

            expect(subscriptionManager.hasSubscription(subject1)).to.equal(true);
            expect(subscriptionManager.hasSubscription(subject2)).to.equal(true);
            expect(subscriptionManager.hasSubscription(subject3)).to.equal(true);
            expect(subscriptionManager.hasSubscription(subject4)).to.equal(true);

            expect(subscriptionManager.getSubjects(subscriber1))
                .to.be.an('array')
                .with.lengthOf(2)
                .to.include.all.members([subject1, subject2]);
            expect(subscriptionManager.getSubjects(subscriber2))
                .to.be.an('array')
                .with.lengthOf(1)
                .to.include.all.members([subject2]);
            expect(subscriptionManager.getSubjects(subscriber3))
                .to.be.an('array')
                .with.lengthOf(3)
                .to.include.all.members([subject1, subject3, subject4]);

            expect(subscriptionManager.getAllSubjects())
                .to.be.an('array')
                .with.lengthOf(4)
                .to.include.all.members([subject1, subject2, subject3, subject4]);

            expect(subscriptionManager.findSubject(subscriber3, subscriptionId4)).to.equal(subject3);
            expect(subscriptionManager.findSubject(subscriber3, 0)).to.equal(``);

            expect(subscriptionManager.findSubscriptionId(subscriber3, subject3)).to.equal(subscriptionId4);
            expect(subscriptionManager.findSubscriptionId(subscriber3, 0)).to.equal(``);

            expect(subscriptionManager.getSubscribers(subject2))
                .to.be.an('array')
                .with.lengthOf(2)
                .to.include.all.members([subscriber1, subscriber2]);

            subscriptionManager.removeSubjectSubscriber(subject1, subscriber1);
            subscriptionManager.removeSubjectSubscriber(subject2, subscriber1);
            subscriptionManager.removeSubjectSubscriber(subject2, subscriber2);
            subscriptionManager.removeSubjectSubscriber(subject3, subscriber3);
            subscriptionManager.removeSubjectSubscriber(subject4, subscriber3);
            subscriptionManager.removeSubjectSubscriber(subject1, subscriber3);

            expect(subscriptionManager.hasSubscription(subject1)).to.equal(false);
            expect(subscriptionManager.hasSubscription(subject2)).to.equal(false);
            expect(subscriptionManager.hasSubscription(subject3)).to.equal(false);
            expect(subscriptionManager.hasSubscription(subject4)).to.equal(false);

            expect(subscriptionManager.getSubjects(subscriber1)).to.be.an('array').with.lengthOf(0);
            expect(subscriptionManager.getSubjects(subscriber2)).to.be.an('array').with.lengthOf(0);
            expect(subscriptionManager.getSubjects(subscriber3)).to.be.an('array').with.lengthOf(0);
        });

        it(`Execution counter`, () => {
            const subscriptionManager = new SubscriptionManager();
            const subject1Cycles = 5;
            const subject2Cycles = 6;
            const subject3Cycles = 7;
            const subject1ExecutionHandler = sinon.spy();
            const subject2ExecutionHandler = sinon.spy();
            const subject3ExecutionHandler = sinon.spy();

            subscriptionManager.addSubjectSubscriber(subject1, subscriber1, subscriptionId1);
            subscriptionManager.addSubjectSubscriber(subject2, subscriber1, subscriptionId2);
            subscriptionManager.addSubjectSubscriber(subject2, subscriber2, subscriptionId3);
            subscriptionManager.addSubjectSubscriber(subject3, subscriber3, subscriptionId4);
            subscriptionManager.addSubjectSubscriber(subject4, subscriber3, subscriptionId5);
            subscriptionManager.addSubjectSubscriber(subject1, subscriber3, subscriptionId6);

            for (let executionCounter = 0;
                 executionCounter < subscriptionManager.getSubscribers(subject1).length * subject1Cycles;
                 executionCounter++) {
                (subscriptionManager.getSubscriptionExecutor(subject1, subject1ExecutionHandler))();
            }

            for (let executionCounter = 0;
                 executionCounter < subscriptionManager.getSubscribers(subject2).length * subject2Cycles;
                 executionCounter++) {
                (subscriptionManager.getSubscriptionExecutor(subject2, subject2ExecutionHandler))();
            }

            for (let executionCounter = 0;
                 executionCounter < subscriptionManager.getSubscribers(subject3).length * subject3Cycles;
                 executionCounter++) {
                (subscriptionManager.getSubscriptionExecutor(subject3, subject3ExecutionHandler))();
            }

            expect(subject1ExecutionHandler.callCount).to.equal(subject1Cycles);
            expect(subject2ExecutionHandler.callCount).to.equal(subject2Cycles);
            expect(subject3ExecutionHandler.callCount).to.equal(subject3Cycles);
        });
    });
});