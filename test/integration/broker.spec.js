const randomString = require(`randomstring`);
const sinon = require(`sinon`);
const chai = require(`chai`);
const expect = chai.expect;
const assert = chai.assert;

const mqtt = require(`mqtt`);

describe(`MQTT broker (should bu ran on localhost:1883)`, () => {
    const MQTT_BROKER_URL = `mqtt://localhost:1883`;
    const TEST_LOGIN = `mqtt_proxy_test_login`;
    const TEST_PASSWORD = `qwertyui`;
    const SUCCESS_STATUS = `success`;
    const REQUEST_TOPIC = `dh/request`;
    const DEVICE_ID = "VQjfBdTl0LvMVBt9RTJMOmwdqr6hWLjln1wZ";
    const NETWORK_ID = 12276;
    let mqttClient;

    beforeEach(() => {
        mqttClient = mqtt.connect(MQTT_BROKER_URL, {
            username: TEST_LOGIN,
            password: TEST_PASSWORD
        });
    });

    afterEach(() => {
        mqttClient.end();
    });

    it(`should connect to MQTT broker on "${MQTT_BROKER_URL}" as user: "${TEST_LOGIN}"`, (done) => {
        mqttClient.on(`connect`, () => {
            done();
        });

        mqttClient.on(`error`, (err) => {
            assert.fail(`error`, `no error`, err);
        });
    });

    it(`should receive access and refresh tokens`, (done) => {
        const responseTopic = `dh/response/token@${mqttClient.options.clientId}`;
        const requestId = `integrationTestRequestId`;

        mqttClient.on(`connect`, () => {
            mqttClient.subscribe(responseTopic, () => {
                mqttClient.publish(REQUEST_TOPIC, JSON.stringify({
                    action: "token",
                    requestId: requestId,
                    login: TEST_LOGIN,
                    password: TEST_PASSWORD
                }));
            });
        });

        mqttClient.on(`message`, (topic, message) => {
            const messageObject = JSON.parse(message.toString());

            expect(topic).to.equal(responseTopic);
            expect(messageObject.status).to.equal(SUCCESS_STATUS);
            expect(messageObject.requestId).to.equal(requestId);
            expect(messageObject).to.include.all.keys(`accessToken`, `refreshToken`);

            done();
        });

        mqttClient.on(`error`, (err) => {
            assert.fail(`error`, `no error`, err);
        });
    });

    it(`should subscribe for notification/insert event and publish new notification`, (done) => {
        const randomNotificationName = randomString.generate();
        const subscriptionTopic = `dh/notification/${NETWORK_ID}/${DEVICE_ID}/${randomNotificationName}`;
        const action = "notification/insert";

        mqttClient.on(`connect`, () => {
            mqttClient.subscribe(subscriptionTopic, () => {
                mqttClient.publish(REQUEST_TOPIC, JSON.stringify({
                    action: action,
                    deviceId: DEVICE_ID,
                    networkId: NETWORK_ID,
                    notification: {
                        notification: randomNotificationName,
                        timestamp: new Date(),
                        parameters: {
                            temperature: 999
                        }
                    }
                }));
            });
        });

        mqttClient.on(`message`, (topic, message) => {
            const messageObject = JSON.parse(message.toString());

            expect(topic).to.equal(subscriptionTopic);
            expect(messageObject.action).to.equal(action);
            expect(messageObject.notification.notification).to.equal(randomNotificationName);

            done();
        });

        mqttClient.on(`error`, (err) => {
            assert.fail(`error`, `no error`, err);
        });
    });

    it(`should subscribe for command/insert event and publish new command`, (done) => {
        const randomCommandName = randomString.generate();
        const subscriptionTopic = `dh/command/${NETWORK_ID}/${DEVICE_ID}/${randomCommandName}`;
        const action = "command/insert";

        mqttClient.on(`connect`, () => {
            mqttClient.subscribe(subscriptionTopic, () => {
                mqttClient.publish(REQUEST_TOPIC, JSON.stringify({
                    action: action,
                    deviceId: DEVICE_ID,
                    networkId: NETWORK_ID,
                    command: {
                        command: randomCommandName,
                        timestamp: new Date(),
                        lifetime: 15,
                        parameters: {
                            value: 1
                        }
                    }
                }));
            });
        });

        mqttClient.on(`message`, (topic, message) => {
            const messageObject = JSON.parse(message.toString());

            if (topic === subscriptionTopic) {
                expect(topic).to.equal(subscriptionTopic);
                expect(messageObject.action).to.equal(action);
                expect(messageObject.command.command).to.equal(randomCommandName);
            }

            done();
        });

        mqttClient.on(`error`, (err) => {
            assert.fail(`error`, `no error`, err);
        });
    });

    it(`should subscribe for command/update event, create and update command`, (done) => {
        const randomCommandName = randomString.generate();
        const subscriptionTopic1 = `dh/command_update/${NETWORK_ID}/${DEVICE_ID}/${randomCommandName}`;
        const subscriptionTopic2 = `dh/command/${NETWORK_ID}/${DEVICE_ID}/${randomCommandName}`;
        const actionInsert = "command/insert";
        const actionUpdate = "command/update";
        const startValue = 1;
        const newValue = 432;

        mqttClient.on(`connect`, () => {
            mqttClient.subscribe(subscriptionTopic1);
            mqttClient.subscribe(subscriptionTopic2, () => {
                mqttClient.publish(REQUEST_TOPIC, JSON.stringify({
                    action: actionInsert,
                    deviceId: DEVICE_ID,
                    networkId: NETWORK_ID,
                    command: {
                        command: randomCommandName,
                        timestamp: new Date(),
                        lifetime: 15,
                        parameters: {
                            value: startValue
                        }
                    }
                }));
            });
        });

        mqttClient.on(`message`, (topic, message) => {
            const messageObject = JSON.parse(message.toString());

            if (topic === subscriptionTopic2) {
                expect(messageObject.command.parameters.value).to.equal(startValue);

                mqttClient.publish(REQUEST_TOPIC, JSON.stringify({
                    action: actionUpdate,
                    deviceId: DEVICE_ID,
                    commandId: messageObject.command.id,
                    command: {
                        command: randomCommandName,
                        parameters: {
                            value: newValue
                        }
                    }
                }));
            } else if (topic === subscriptionTopic1) {
                expect(messageObject.action).to.equal(actionUpdate);
                expect(messageObject.command.parameters.value).to.equal(newValue);
                expect(messageObject.command.command).to.equal(randomCommandName);

                done();
            }
        });

        mqttClient.on(`error`, (err) => {
            assert.fail(`error`, `no error`, err);
        });
    });

    it(`should be able to unsubscribe from previous subscriptions`, (done) => {
        const subscriptionTopic1 = `dh/notification/${NETWORK_ID}/${DEVICE_ID}/light`;
        const subscriptionTopic2 = `dh/command/${NETWORK_ID}/${DEVICE_ID}/switchOff`;
        const actionNotification = "notification/insert";
        const actionCommand = "command/insert";
        const subscription1Spy = sinon.spy();
        const subscription2Spy = sinon.spy();

        mqttClient.on(`connect`, () => {
            mqttClient.subscribe(subscriptionTopic1, () => {
                mqttClient.publish(REQUEST_TOPIC, JSON.stringify({
                    action: actionNotification,
                    deviceId: DEVICE_ID,
                    networkId: NETWORK_ID,
                    notification: {
                        notification: `light`,
                        timestamp: new Date(),
                        parameters: {
                            status: `on`
                        }
                    }
                }));
            });

            mqttClient.subscribe(subscriptionTopic2, () => {
                mqttClient.publish(REQUEST_TOPIC, JSON.stringify({
                    action: actionCommand,
                    deviceId: DEVICE_ID,
                    networkId: NETWORK_ID,
                    command: {
                        command: 'switchOff',
                        timestamp: new Date(),
                        lifetime: 60,
                        parameters: {
                            value: 'off'
                        }
                    }
                }));
            });
        });

        mqttClient.on(`message`, (topic, message) => {
            if (topic === subscriptionTopic1) {
                subscription1Spy();

                mqttClient.unsubscribe(subscriptionTopic1, () => {
                    mqttClient.publish(REQUEST_TOPIC, JSON.stringify({
                        action: actionNotification,
                        deviceId: DEVICE_ID,
                        networkId: NETWORK_ID,
                        notification: {
                            notification: `light`,
                            timestamp: new Date(),
                            parameters: {
                                status: `off`
                            }
                        }
                    }));
                });
            } else if (topic === subscriptionTopic2) {
                subscription2Spy();

                mqttClient.unsubscribe(subscriptionTopic2, () => {
                    mqttClient.publish(REQUEST_TOPIC, JSON.stringify({
                        action: actionCommand,
                        deviceId: DEVICE_ID,
                        networkId: NETWORK_ID,
                        command: {
                            command: 'switchOn',
                            timestamp: new Date(),
                            lifetime: 60,
                            parameters: {
                                value: 'on'
                            }
                        }
                    }));
                });
            }
        });

        mqttClient.on(`error`, (err) => {
            assert.fail(`error`, `no error`, err);
        });

        setTimeout(() => {
            expect(subscription1Spy.calledOnce).to.equal(true);
            expect(subscription2Spy.calledOnce).to.equal(true);

            done();
        }, 4500);
    }).timeout(5000);

    it(`should send notification of same subscription for each subscriber only once`, (done) => {
        const SUBSCRIPTION_TOPIC = `dh/notification/${NETWORK_ID}/${DEVICE_ID}/sharedNotification`;
        const ACTION_NOTIFICATION = "notification/insert";
        const mqttClient2 = mqtt.connect(MQTT_BROKER_URL, { username: TEST_LOGIN, password: TEST_PASSWORD });
        const mqttClient3 = mqtt.connect(MQTT_BROKER_URL, { username: TEST_LOGIN, password: TEST_PASSWORD });
        let subscriptionCounter = 0;
        const sharedPublisher = () => {
            subscriptionCounter++;

            if (subscriptionCounter > 2) {
                mqttClient.publish(REQUEST_TOPIC, JSON.stringify({
                    action: ACTION_NOTIFICATION,
                    deviceId: DEVICE_ID,
                    networkId: NETWORK_ID,
                    notification: {
                        notification: `sharedNotification`,
                        timestamp: new Date(),
                        parameters: {
                            status: `share`
                        }
                    }
                }));
            }
        };

        const mqttClient1Spy = sinon.spy();
        const mqttClient2Spy = sinon.spy();
        const mqttClient3Spy = sinon.spy();

        mqttClient.on(`connect`, () => {
            mqttClient.subscribe(SUBSCRIPTION_TOPIC, () => sharedPublisher());
        });

        mqttClient2.on(`connect`, () => {
            mqttClient2.subscribe(SUBSCRIPTION_TOPIC, () => sharedPublisher());
        });

        mqttClient3.on(`connect`, () => {
            mqttClient3.subscribe(SUBSCRIPTION_TOPIC, () => sharedPublisher());
        });

        mqttClient.on(`message`, (topic, message) => {
            if (topic === SUBSCRIPTION_TOPIC) {
                mqttClient1Spy();
            }
        });

        mqttClient2.on(`message`, (topic, message) => {
            if (topic === SUBSCRIPTION_TOPIC) {
                mqttClient2Spy();
            }
        });

        mqttClient3.on(`message`, (topic, message) => {
            if (topic === SUBSCRIPTION_TOPIC) {
                mqttClient3Spy();
                mqttClient3.unsubscribe(SUBSCRIPTION_TOPIC, () => sharedPublisher());
            }
        });

        setTimeout(() => {
            mqttClient2.end();
            mqttClient3.end();

            expect(mqttClient1Spy.callCount).to.equal(2);
            expect(mqttClient2Spy.callCount).to.equal(2);
            expect(mqttClient3Spy.calledOnce).to.equal(true);

            done();
        }, 4500);
    }).timeout(5000);
});