const DeviceHiveUtils = require(`../../../util/DeviceHiveUtils.js`);
const chai = require(`chai`);
const expect = chai.expect;


describe(DeviceHiveUtils.name, () => {
    const staticMethodsNames = {
        createSubscriptionDataObject: `createSubscriptionDataObject`,
        isSameTopicRoot: `isSameTopicRoot`,
        isLessGlobalTopic: `isLessGlobalTopic`,
        isMoreGlobalTopic: `isMoreGlobalTopic`,
        getTopicSubscribeRequestAction: `getTopicSubscribeRequestAction`,
        getTopicUnsubscribeRequestAction: `getTopicUnsubscribeRequestAction`,
        getTopicSubscriptionResponseAction: `getTopicSubscriptionResponseAction`
    };

    it(`should be a class`, () => {
        expect(DeviceHiveUtils).to.be.a(`Function`);
    });

    it(`should has next static methods: ${Object.keys(staticMethodsNames).join(`, `)}`, () => {
        Object.keys(staticMethodsNames).forEach((staticMethodName) => {
            expect(DeviceHiveUtils[staticMethodName]).to.be.a(`Function`);
        });
    });

    describe(`Static method: ${staticMethodsNames.createSubscriptionDataObject}`, () => {
        const expectationObject1 = {
            topic: `dh/notification/12276/deviceId/name`,
            expectation: {
                action: `notification/subscribe`,
                networkIds: [],
                deviceIds: [`deviceId`],
                names: [`name`]
            }
        };
        const expectationObject2 = {
            topic: `dh/notification/+/deviceId/#`,
            expectation: {
                action: `notification/subscribe`,
                networkIds: [],
                deviceIds: [`deviceId`],
                names: []
            }
        };
        const expectationObject3 = {
            topic: `dh/command/12276/+/temperature`,
            expectation: {
                action: `command/subscribe`,
                networkIds: [`12276`],
                deviceIds: [],
                names: [`temperature`]
            }
        };
        const expectationObject4 = {
            topic: `dh/command_update/12276/+/temperature`,
            expectation: {
                action: `command/subscribe`,
                networkIds: [`12276`],
                deviceIds: [],
                names: [`temperature`],
                returnUpdatedCommands: true
            }
        };

        it(`subscription data object for "${expectationObject1.topic}"`, () => {
            expect(DeviceHiveUtils.createSubscriptionDataObject(expectationObject1.topic))
                .to.deep.equal(expectationObject1.expectation);
        });

        it(`subscription data object for "${expectationObject2.topic}"`, () => {
            expect(DeviceHiveUtils.createSubscriptionDataObject(expectationObject2.topic))
                .to.deep.equal(expectationObject2.expectation);
        });

        it(`subscription data object for "${expectationObject3.topic}"`, () => {
            expect(DeviceHiveUtils.createSubscriptionDataObject(expectationObject3.topic))
                .to.deep.equal(expectationObject3.expectation);
        });

        it(`subscription data object for "${expectationObject4.topic}"`, () => {
            expect(DeviceHiveUtils.createSubscriptionDataObject(expectationObject4.topic))
                .to.deep.equal(expectationObject4.expectation);
        });
    });

    describe(`Static method: ${staticMethodsNames.isSameTopicRoot}`, () => {
        const topic1 = `dh/request`;
        const topic2 = `dh/response`;
        const topic3 = `dh/notification/1227/deviceId/#`;
        const topic4 = `dh/notification/+/deviceId/#`;
        const topic5 = `dh/#`;

        it(`"${topic1}" and "${topic2}" has different topic root`, () => {
            expect(DeviceHiveUtils.isSameTopicRoot(topic1, topic2)).to.equal(false);
        });

        it(`"${topic2}" and "${topic3}" has different topic root`, () => {
            expect(DeviceHiveUtils.isSameTopicRoot(topic2, topic3)).to.equal(false);
        });

        it(`"${topic3}" and "${topic4}" has same topic root`, () => {
            expect(DeviceHiveUtils.isSameTopicRoot(topic3, topic4)).to.equal(true);
        });

        it(`"${topic4}" and "${topic5}" has same topic root`, () => {
            expect(DeviceHiveUtils.isSameTopicRoot(topic4, topic5)).to.equal(true);
        });
    });

    describe(`Static method: ${staticMethodsNames.isLessGlobalTopic}`, () => {
        const topic1 = `dh/notification/1227/deviceId/#`;
        const topic2 = `dh/notification/+/deviceId/#`;
        const topic3 = `dh/notification/#`;
        const topic4 = `dh/command_update/+/deviceId/#`;
        const topic5 = `dh/#`;
        const topic6 = `dh/notification/+`;

        it(`"${topic1}" should be less global than "${topic2}"`, () => {
            expect(DeviceHiveUtils.isLessGlobalTopic(topic1, topic2)).to.equal(true);
        });

        it(`"${topic2}" should be less global than "${topic3}"`, () => {
            expect(DeviceHiveUtils.isLessGlobalTopic(topic2, topic3)).to.equal(true);
        });

        it(`"${topic3}" should not be less global than "${topic4}"`, () => {
            expect(DeviceHiveUtils.isLessGlobalTopic(topic3, topic4)).to.equal(false);
        });

        it(`"${topic4}" should be less global than "${topic5}"`, () => {
            expect(DeviceHiveUtils.isLessGlobalTopic(topic4, topic5)).to.equal(true);
        });

        it(`"${topic3}" should be less global than "${topic6}"`, () => {
            expect(DeviceHiveUtils.isLessGlobalTopic(topic3, topic6)).to.equal(true);
        });
    });

    describe(`Static method: ${staticMethodsNames.isMoreGlobalTopic}`, () => {
        const topic1 = `dh/notification/1227/deviceId/#`;
        const topic2 = `dh/notification/+/deviceId/#`;
        const topic3 = `dh/notification/#`;
        const topic4 = `dh/command_update/+/deviceId/#`;
        const topic5 = `dh/#`;
        const topic6 = `dh/notification/+`;

        it(`"${topic1}" should not be more global than "${topic2}"`, () => {
            expect(DeviceHiveUtils.isMoreGlobalTopic(topic1, topic2)).to.equal(false);
        });

        it(`"${topic3}" should be more global than "${topic2}"`, () => {
            expect(DeviceHiveUtils.isMoreGlobalTopic(topic3, topic2)).to.equal(true);
        });

        it(`"${topic3}" should not be more global than "${topic4}"`, () => {
            expect(DeviceHiveUtils.isMoreGlobalTopic(topic3, topic4)).to.equal(false);
        });

        it(`"${topic4}" should not be more global than "${topic5}"`, () => {
            expect(DeviceHiveUtils.isMoreGlobalTopic(topic4, topic5)).to.equal(false);
        });

        it(`"${topic5}" should be more global than "${topic3}"`, () => {
            expect(DeviceHiveUtils.isMoreGlobalTopic(topic5, topic3)).to.equal(true);
        });
    });

    describe(`Static method: ${staticMethodsNames.getTopicSubscribeRequestAction}`, () => {
        const expectation1 = [`dh/notification/1227/deviceId/name`, `notification/subscribe`];
        const expectation2 = [`dh/command/1227/deviceId/name`, `command/subscribe`];
        const expectation3 = [`dh/command_update/1227/deviceId/name`, `command/subscribe`];
        const expectation4 = [`dh/response/notification`, ``];

        it(`Action for "${expectation1[0]}" should be "${expectation1[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicSubscribeRequestAction(expectation1[0])).to.equal(expectation1[1]);
        });

        it(`Action for "${expectation2[0]}" should be "${expectation2[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicSubscribeRequestAction(expectation2[0])).to.equal(expectation2[1]);
        });

        it(`Action for "${expectation3[0]}" should be "${expectation3[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicSubscribeRequestAction(expectation3[0])).to.equal(expectation3[1]);
        });

        it(`Action for "${expectation4[0]}" should be "${expectation4[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicSubscribeRequestAction(expectation4[0])).to.equal(expectation4[1]);
        });
    });

    describe(`Static method: ${staticMethodsNames.getTopicUnsubscribeRequestAction}`, () => {
        const expectation1 = [`dh/notification/1227/deviceId/name`, `notification/unsubscribe`];
        const expectation2 = [`dh/command/1227/deviceId/name`, `command/unsubscribe`];
        const expectation3 = [`dh/command_update/1227/deviceId/name`, `command/unsubscribe`];
        const expectation4 = [`dh/response/notification`, ``];

        it(`Action for "${expectation1[0]}" should be "${expectation1[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicUnsubscribeRequestAction(expectation1[0])).to.equal(expectation1[1]);
        });

        it(`Action for "${expectation2[0]}" should be "${expectation2[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicUnsubscribeRequestAction(expectation2[0])).to.equal(expectation2[1]);
        });

        it(`Action for "${expectation3[0]}" should be "${expectation3[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicUnsubscribeRequestAction(expectation3[0])).to.equal(expectation3[1]);
        });

        it(`Action for "${expectation4[0]}" should be "${expectation4[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicUnsubscribeRequestAction(expectation4[0])).to.equal(expectation4[1]);
        });
    });

    describe(`Static method: ${staticMethodsNames.getTopicSubscriptionResponseAction}`, () => {
        const expectation1 = [`dh/notification/1227/deviceId/name`, `notification/insert`];
        const expectation2 = [`dh/command/1227/deviceId/name`, `command/insert`];
        const expectation3 = [`dh/command_update/1227/deviceId/name`, `command/update`];
        const expectation4 = [`dh/request/notification`, ``];

        it(`Action for "${expectation1[0]}" should be "${expectation1[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicSubscriptionResponseAction(expectation1[0])).to.equal(expectation1[1]);
        });

        it(`Action for "${expectation2[0]}" should be "${expectation2[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicSubscriptionResponseAction(expectation2[0])).to.equal(expectation2[1]);
        });

        it(`Action for "${expectation3[0]}" should be "${expectation3[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicSubscriptionResponseAction(expectation3[0])).to.equal(expectation3[1]);
        });

        it(`Action for "${expectation4[0]}" should be "${expectation4[1]}"`, () => {
            expect(DeviceHiveUtils.getTopicSubscriptionResponseAction(expectation4[0])).to.equal(expectation4[1]);
        });
    });
});