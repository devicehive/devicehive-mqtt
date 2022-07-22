const CONST = require(`./constants.json`);
const Config = require(`../config`).test.integration;
const mqtt = require(`mqtt`);
const EventEmitter = require('events');
const randomString = require(`randomstring`);
const sinon = require(`sinon`);
const chai = require(`chai`);
const expect = chai.expect;
const assert = chai.assert;


describe(`MQTT broker (should be run on localhost:1883)`, () => {

    describe(`User API`, () => require(`./api/user.js`));

    describe(`Configuration API`, () => require(`./api/configuration.js`));

    describe(`Device API`, () => require(`./api/device.js`));

    describe(`Device Type API`, () => require(`./api/devicetype.js`));

    describe(`Network API`, () => require(`./api/network.js`));

    describe(`Command API`, () => require(`./api/command.js`));

    describe(`Notification API`, () => require(`./api/notification.js`));

    describe(`Subscription API`, () => require(`./api/subscription.js`));

    describe(`Token API`, () => require(`./api/token.js`));

    describe(`Authentication API`, () => require(`./api/authentication.js`));

    describe(`Server API`, () => require(`./api/server.js`));

    describe(`Cluster API`, () => require(`./api/cluster.js`));

    describe(`Connection without credentials. Postponed authentication`, () => {
        const ee = new EventEmitter();
        let mqttClient, accessToken;

        it(`should connect to MQTT broker without user credentials`, () => {
            return new Promise((resolve) => {
                mqttClient = mqtt.connect(Config.MQTT_BROKER_URL);

                mqttClient.on(`message`, (topic, message) => {
                    ee.emit(topic.split(`/`)[2].split(`@`)[0], JSON.parse(message.toString()))
                });

                mqttClient.on('connect', () => {
                    resolve();
                });
            });
        });

        it(`should not be able to subscribe for DH topic (except token and authenticate)`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`dh/notification/#`, (err, granted) => {
                    if (granted[0].qos === 128) { // TODO look into it. Maybe bug in the mosca
                        resolve();
                    } else {
                        reject()
                    }
                });
            });
        });

        it(`should be able to subscribe for DH token response topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`dh/response/token@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should be able to subscribe for DH authenticate response topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`dh/response/authenticate@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should create access and refresh token by user credentials`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(`token`, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(CONST.SUCCESS_STATUS);
                        expect(message).to.include.all.keys(`accessToken`, `refreshToken`);

                        accessToken = message.accessToken;

                        resolve();
                    }
                });

                mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                    action: `token`,
                    requestId: requestId,
                    login: Config.TEST_LOGIN,
                    password: Config.TEST_PASSWORD
                }));
            });
        });

        it(`should authenticate user by access token`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(`authenticate`, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(CONST.SUCCESS_STATUS);

                        resolve();
                    }
                });

                mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                    action: `authenticate`,
                    requestId: requestId,
                    token: accessToken
                }));
            });
        });

        it(`should be able to subscribe for any DH topic after success authentication`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`dh/notification/#`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should disconnect from MQTT broker`, () => {
            return new Promise((resolve) => {
                mqttClient.end(() => {
                    resolve();
                });
            });
        });
    });

    describe(`Basic functionality`, () => {
        let mqttClientId, mqttClient;

        beforeEach(() => {
            mqttClientId = randomString.generate();
            mqttClient = mqtt.connect(Config.MQTT_BROKER_URL, {
                clientId: mqttClientId,
                username: Config.TEST_LOGIN,
                password: Config.TEST_PASSWORD
            });
        });

        afterEach(() => {
            mqttClient.end();
        });

        it(`should connect to MQTT broker on "${Config.MQTT_BROKER_URL}" as user: "${Config.TEST_LOGIN}"`, (done) => {
            mqttClient.on(`connect`, () => {
                done();
            });

            mqttClient.on(`error`, (err) => {
                assert.fail(`error`, `no error`, err);
            });
        });

        it(`should receive access and refresh tokens`, (done) => {
            const responseTopic = `dh/response/token@${mqttClientId}`;
            const requestId = randomString.generate();

            mqttClient.on(`connect`, () => {
                mqttClient.subscribe(responseTopic, () => {
                    mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                        action: `token`,
                        requestId: requestId,
                        login: Config.TEST_LOGIN,
                        password: Config.TEST_PASSWORD
                    }));
                });
            });

            mqttClient.on(`message`, (topic, message) => {
                const messageObject = JSON.parse(message.toString());

                expect(topic).to.equal(responseTopic);
                expect(messageObject.status).to.equal(CONST.SUCCESS_STATUS);
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
            const subscriptionTopic = `dh/notification/${Config.NETWORK_ID}/${Config.DEVICE_TYPE_ID}/${Config.DEVICE_ID}/${randomNotificationName}`;
            const action = `notification/insert`;

            mqttClient.on(`connect`, () => {
                mqttClient.subscribe(subscriptionTopic, () => {
                    mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                        action: action,
                        deviceId: Config.DEVICE_ID,
                        networkId: Config.NETWORK_ID,
                        deviceTypeId: Config.DEVICE_TYPE_ID,
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
            const subscriptionTopic = `dh/command/${Config.NETWORK_ID}/${Config.DEVICE_TYPE_ID}/${Config.DEVICE_ID}/${randomCommandName}`;
            const action = `command/insert`;

            mqttClient.on(`connect`, () => {
                mqttClient.subscribe(subscriptionTopic, () => {
                    mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                        action: action,
                        deviceId: Config.DEVICE_ID,
                        networkId: Config.NETWORK_ID,
                        deviceTypeId: Config.DEVICE_TYPE_ID,
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
            const subscriptionTopic1 = `dh/command_update/${Config.NETWORK_ID}/${Config.DEVICE_TYPE_ID}/${Config.DEVICE_ID}/${randomCommandName}`;
            const subscriptionTopic2 = `dh/command/${Config.NETWORK_ID}/${Config.DEVICE_TYPE_ID}/${Config.DEVICE_ID}/${randomCommandName}`;
            const actionInsert = `command/insert`;
            const actionUpdate = `command/update`;
            const startValue = 1;
            const newValue = 432;

            mqttClient.on(`connect`, () => {
                mqttClient.subscribe(subscriptionTopic1);
                mqttClient.subscribe(subscriptionTopic2, () => {
                    mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                        action: actionInsert,
                        deviceId: Config.DEVICE_ID,
                        networkId: Config.NETWORK_ID,
                        deviceTypeId: Config.DEVICE_TYPE_ID,
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

                    mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                        action: actionUpdate,
                        deviceId: Config.DEVICE_ID,
                        networkId: Config.NETWORK_ID,
                        deviceTypeId: Config.DEVICE_TYPE_ID,
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

                    done();
                }
            });

            mqttClient.on(`error`, (err) => {
                assert.fail(`error`, `no error`, err);
            });
        });

        it(`should be able to unsubscribe from previous subscriptions`, (done) => {
            const subscriptionTopic1 = `dh/notification/${Config.NETWORK_ID}/${Config.DEVICE_TYPE_ID}/${Config.DEVICE_ID}/light`;
            const subscriptionTopic2 = `dh/command/${Config.NETWORK_ID}/${Config.DEVICE_TYPE_ID}/${Config.DEVICE_ID}/switchOff`;
            const actionNotification = `notification/insert`;
            const actionCommand = `command/insert`;
            const subscription1Spy = sinon.spy();
            const subscription2Spy = sinon.spy();

            mqttClient.on(`connect`, () => {
                mqttClient.subscribe(subscriptionTopic1, () => {
                    mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                        action: actionNotification,
                        deviceId: Config.DEVICE_ID,
                        networkId: Config.NETWORK_ID,
                        deviceTypeId: Config.DEVICE_TYPE_ID,
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
                    mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                        action: actionCommand,
                        deviceId: Config.DEVICE_ID,
                        networkId: Config.NETWORK_ID,
                        deviceTypeId: Config.DEVICE_TYPE_ID,
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
                        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                            action: actionNotification,
                            deviceId: Config.DEVICE_ID,
                            networkId: Config.NETWORK_ID,
                            deviceTypeId: Config.DEVICE_TYPE_ID,
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
                        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                            action: actionCommand,
                            deviceId: Config.DEVICE_ID,
                            networkId: Config.NETWORK_ID,
                            deviceTypeId: Config.DEVICE_TYPE_ID,
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

            /** TODO find better way than check expectations in setTimeout
             */
            setTimeout(() => {
                expect(subscription1Spy.calledOnce).to.equal(true);
                expect(subscription2Spy.calledOnce).to.equal(true);

                done();
            }, 4500);
        }).timeout(5000);

        it(`should send notification of same subscription for each subscriber only once`, (done) => {
            const SUBSCRIPTION_TOPIC = `dh/notification/${Config.NETWORK_ID}/${Config.DEVICE_TYPE_ID}/${Config.DEVICE_ID}/sharedNotification`;
            const ACTION_NOTIFICATION = `notification/insert`;
            const mqttClient2 = mqtt.connect(Config.MQTT_BROKER_URL, { username: Config.TEST_LOGIN, password: Config.TEST_PASSWORD });
            const mqttClient3 = mqtt.connect(Config.MQTT_BROKER_URL, { username: Config.TEST_LOGIN, password: Config.TEST_PASSWORD });
            let subscriptionCounter = 0;
            const sharedPublisher = () => {
                subscriptionCounter++;

                if (subscriptionCounter > 2) {
                    mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                        action: ACTION_NOTIFICATION,
                        deviceId: Config.DEVICE_ID,
                        networkId: Config.NETWORK_ID,
                        deviceTypeId: Config.DEVICE_TYPE_ID,
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

            /** TODO find better way than check expectations in setTimeout
             */
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
});
