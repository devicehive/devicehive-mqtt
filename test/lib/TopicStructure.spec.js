const TopicStructure = require(`../../lib/TopicStructure.js`);
const chai = require(`chai`);
const expect = chai.expect;


describe(TopicStructure.name, () => {
    const dhStr = `dh`;
    const notificationStr = `notification`;
    const commandStr = `command`;
    const commandUpdateStr = `command_update`;
    const requestStr = `request`;
    const responseStr = `response`;
    const networkId = `12276`;
    const deviceId = `VQjfBdTl0LvMVBt9RTJMOmwdqr6hWLjln1wZ`;
    const clientId = `clientId`;
    const name = `temperature`;
    const listOfMethods = [`isDH`, `getDomain`, `hasOwner`, `getOwner`, `isSubscription`,
        `isResponse`, `isRequest`, `getAction`, `getNetwork`, `getDevice`, `getName`,
        `isNotification`, `isCommandInsert`, `isCommandUpdate`];
    const notDhTopic = `not/dh/topic`;
    const dhNotificationTopic = `${dhStr}/${notificationStr}/${networkId}/${deviceId}/${name}`;
    const dhCommandTopic = `${dhStr}/${commandStr}/${networkId}/${deviceId}/${name}`;
    const dhCommandUpdateTopic = `${dhStr}/${commandUpdateStr}/${networkId}/${deviceId}/${name}`;
    const dhRequestTopic = `${dhStr}/${requestStr}`;
    const dhNotificationResponseTopic = `${dhStr}/${responseStr}/${notificationStr}@${clientId}`;


    it(`should be a class`, () => {
        expect(TopicStructure).to.be.a(`Function`);
    });

    it(`should creates a TopicStructure object from MQTT topic string`, () => {
        expect(new TopicStructure()).to.be.a(`Object`);
    });

    it(`should has next methods: ${listOfMethods.join(`, `)}`, () => {
        listOfMethods.forEach((methodName) => {
            expect(new TopicStructure()[methodName]).to.be.a(`Function`);
        });
    });

    describe(`Topic: ${notDhTopic}`, () => {
        const topicStructure = new TopicStructure(notDhTopic);

        it(`should not be a DH topic`, () => {
            expect(topicStructure.isDH()).to.equal(false);
        });
    });

    describe(`Topic: ${dhNotificationTopic}`, () => {
        const topicStructure = new TopicStructure(dhNotificationTopic);

        it(`should be a DH topic`, () => {
            expect(topicStructure.isDH()).to.equal(true);
        });

        it(`should be a subscription topic`, () => {
            expect(topicStructure.isSubscription()).to.equal(true);
        });

        it(`should be a notification/insert topic`, () => {
            expect(topicStructure.isNotification()).to.equal(true);
        });

        it(`should has network id: ${networkId}`, () => {
            expect(topicStructure.getNetwork()).to.equal(networkId);
        });

        it(`should has device id: ${deviceId}`, () => {
            expect(topicStructure.getDevice()).to.equal(deviceId);
        });

        it(`should has notification name: ${name}`, () => {
            expect(topicStructure.getName()).to.equal(name);
        });
    });

    describe(`Topic: ${dhCommandTopic}`, () => {
        const topicStructure = new TopicStructure(dhCommandTopic);

        it(`should be a DH topic`, () => {
            expect(topicStructure.isDH()).to.equal(true);
        });

        it(`should be a subscription topic`, () => {
            expect(topicStructure.isSubscription()).to.equal(true);
        });

        it(`should be a command/insert topic`, () => {
            expect(topicStructure.isCommandInsert()).to.equal(true);
        });

        it(`should has network id: ${networkId}`, () => {
            expect(topicStructure.getNetwork()).to.equal(networkId);
        });

        it(`should has device id: ${deviceId}`, () => {
            expect(topicStructure.getDevice()).to.equal(deviceId);
        });

        it(`should has notification name: ${name}`, () => {
            expect(topicStructure.getName()).to.equal(name);
        });
    });

    describe(`Topic: ${dhCommandUpdateTopic}`, () => {
        const topicStructure = new TopicStructure(dhCommandUpdateTopic);

        it(`should be a DH topic`, () => {
            expect(topicStructure.isDH()).to.equal(true);
        });

        it(`should be a subscription topic`, () => {
            expect(topicStructure.isSubscription()).to.equal(true);
        });

        it(`should be a command/update topic`, () => {
            expect(topicStructure.isCommandUpdate()).to.equal(true);
        });

        it(`should has network id: ${networkId}`, () => {
            expect(topicStructure.getNetwork()).to.equal(networkId);
        });

        it(`should has device id: ${deviceId}`, () => {
            expect(topicStructure.getDevice()).to.equal(deviceId);
        });

        it(`should has notification name: ${name}`, () => {
            expect(topicStructure.getName()).to.equal(name);
        });
    });

    describe(`Topic: ${dhRequestTopic}`, () => {
        const topicStructure = new TopicStructure(dhRequestTopic);

        it(`should be a DH topic`, () => {
            expect(topicStructure.isDH()).to.equal(true);
        });

        it(`should be a request topic`, () => {
            expect(topicStructure.isRequest()).to.equal(true);
        });

        it(`should not be a response topic`, () => {
            expect(topicStructure.isResponse()).to.equal(false);
        });

        it(`should not be a subscription topic`, () => {
            expect(topicStructure.isSubscription()).to.equal(false);
        });
    });

    describe(`Topic: ${dhNotificationResponseTopic}`, () => {
        const topicStructure = new TopicStructure(dhNotificationResponseTopic);

        it(`should be a DH topic`, () => {
            expect(topicStructure.isDH()).to.equal(true);
        });

        it(`should be a request topic`, () => {
            expect(topicStructure.isResponse()).to.equal(true);
        });

        it(`should has an action: ${notificationStr}`, () => {
            expect(topicStructure.getAction()).to.equal(notificationStr);
        });

        it(`should has an owner: ${clientId}`, () => {
            expect(topicStructure.getOwner()).to.equal(clientId);
        });

        it(`should not be a request topic`, () => {
            expect(topicStructure.isRequest()).to.equal(false);
        });

        it(`should not be a subscription topic`, () => {
            expect(topicStructure.isSubscription()).to.equal(false);
        });
    });
});