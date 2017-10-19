const SubscriptionEntry = require(`../../lib/SubscriptionEntry.js`);
const chai = require(`chai`);
const expect = chai.expect;

describe(SubscriptionEntry.name, () => {
    const listOfMethods = [`getSubscriptionCounter`, `addSubscriber`, `removeSubscriber`,
        `getSubscriber`, `getSubscribers`, `getSubscriptionId`, `hasSubscriber`, `hasSubscriptionId`];
    const subscriber1 = `subscriber1`;
    const subscriber2 = `subscriber2`;
    const subscriber3 = `subscriber3`;
    const subscriptionId1 = `1`;
    const subscriptionId2 = `2`;
    const subscriptionId3 = `3`;


    it(`should be a class`, () => {
        expect(SubscriptionEntry).to.be.a(`Function`);
    });

    it(`should has next methods: ${listOfMethods.join(`, `)}`, () => {
        listOfMethods.forEach((methodName) => {
            expect(new SubscriptionEntry(subscriber1, subscriptionId1)[methodName]).to.be.a(`Function`);
        });
    });

    describe(`Basic functionality`, () => {
        it(`should correct handle subscription entries`, () => {
            const subscriptionEntry = new SubscriptionEntry(subscriber1, subscriptionId1);

            subscriptionEntry.addSubscriber(subscriber2, subscriptionId2);
            subscriptionEntry.addSubscriber(subscriber3, subscriptionId3);

            expect(subscriptionEntry.hasSubscriber(subscriber1)).to.equal(true);
            expect(subscriptionEntry.hasSubscriber(subscriber2)).to.equal(true);
            expect(subscriptionEntry.hasSubscriber(subscriber3)).to.equal(true);

            expect(subscriptionEntry.hasSubscriptionId(subscriptionId1)).to.equal(true);
            expect(subscriptionEntry.hasSubscriptionId(subscriptionId2)).to.equal(true);
            expect(subscriptionEntry.hasSubscriptionId(subscriptionId3)).to.equal(true);

            expect(subscriptionEntry.getSubscriptionCounter()).to.equal(3);

            expect(subscriptionEntry.getSubscribers())
                .to.be.an('array')
                .with.lengthOf(3)
                .to.include.all.members([subscriber1, subscriber2, subscriber3]);

            expect(subscriptionEntry.getSubscriber(subscriptionId1)).to.equal(subscriber1);
            expect(subscriptionEntry.getSubscriber(subscriptionId2)).to.equal(subscriber2);
            expect(subscriptionEntry.getSubscriber(subscriptionId3)).to.equal(subscriber3);

            expect(subscriptionEntry.getSubscriptionId(subscriber1)).to.equal(subscriptionId1);
            expect(subscriptionEntry.getSubscriptionId(subscriber2)).to.equal(subscriptionId2);
            expect(subscriptionEntry.getSubscriptionId(subscriber3)).to.equal(subscriptionId3);

            subscriptionEntry.removeSubscriber(subscriber1, subscriptionId1);
            subscriptionEntry.removeSubscriber(subscriber2, subscriptionId2);
            subscriptionEntry.removeSubscriber(subscriber3, subscriptionId3);

            expect(subscriptionEntry.hasSubscriber(subscriber1)).to.equal(false);
            expect(subscriptionEntry.hasSubscriber(subscriber2)).to.equal(false);
            expect(subscriptionEntry.hasSubscriber(subscriber3)).to.equal(false);

            expect(subscriptionEntry.hasSubscriptionId(subscriptionId1)).to.equal(false);
            expect(subscriptionEntry.hasSubscriptionId(subscriptionId2)).to.equal(false);
            expect(subscriptionEntry.hasSubscriptionId(subscriptionId3)).to.equal(false);

            expect(subscriptionEntry.getSubscriptionCounter()).to.equal(0);
            expect(subscriptionEntry.getSubscribers()).to.be.an('array').with.lengthOf(0);
        });
    });
});