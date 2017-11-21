const mqtt = require(`mqtt`);
const EventEmitter = require('events');
const randomString = require(`randomstring`);
const sinon = require(`sinon`);
const chai = require(`chai`);
const expect = chai.expect;
const assert = chai.assert;

const ee = new EventEmitter();

const DH_RESPONSE_TOPIC = `dh/response`;
const DH_REQUEST_TOPIC = `dh/request`;
const MQTT_BROKER_URL = `mqtt://localhost:1883`;
const TEST_LOGIN = `mqtt_proxy_test_login`;
const TEST_PASSWORD = `qwertyui`;
const TEST_USER_ID = 14347;
const SUCCESS_STATUS = `success`;
const ERROR_STATUS = `error`;
const DEVICE_ID = `VQjfBdTl0LvMVBt9RTJMOmwdqr6hWLjln1wZ`;
const NETWORK_ID = 12276;
const SUBJECT = `subscription`;
const LIST_OPERATION = `list`;
const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
const LIST_TOPIC = `${DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
const TEST_NAME = `testName`;
const SUBSCRIPTION_COMMAND_TYPE = `command`;
const SUBSCRIPTION_NOTIFICATION_TYPE = `notification`;
const SUBSCRIPTION_COMMAND_TOPIC_1 = `dh/${SUBSCRIPTION_COMMAND_TYPE}/${NETWORK_ID}/${DEVICE_ID}/${TEST_NAME}1`;
const SUBSCRIPTION_COMMAND_TOPIC_2 = `dh/${SUBSCRIPTION_COMMAND_TYPE}/${NETWORK_ID}/${DEVICE_ID}/${TEST_NAME}2`;
const SUBSCRIPTION_NOTIFICATION_TOPIC_1 = `dh/${SUBSCRIPTION_NOTIFICATION_TYPE}/${NETWORK_ID}/${DEVICE_ID}/${TEST_NAME}1`;
const SUBSCRIPTION_NOTIFICATION_TOPIC_2 = `dh/${SUBSCRIPTION_NOTIFICATION_TYPE}/${NETWORK_ID}/${DEVICE_ID}/${TEST_NAME}2`;
let mqttClient;

it(`should connect to MQTT broker`, () => {
    return new Promise((resolve) => {
        mqttClient = mqtt.connect(MQTT_BROKER_URL, {
            username: TEST_LOGIN,
            password: TEST_PASSWORD
        });

        mqttClient.on(`message`, (topic, message) => {
            ee.emit(topic.split(`/`)[3].split(`@`)[0], JSON.parse(message.toString()))
        });

        mqttClient.on('connect', () => {
            resolve();
        });
    });
});

it(`should subscribe for "${LIST_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${LIST_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should subscribe for "${SUBSCRIPTION_COMMAND_TOPIC_1}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${SUBSCRIPTION_COMMAND_TOPIC_1}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should subscribe for "${SUBSCRIPTION_COMMAND_TOPIC_2}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${SUBSCRIPTION_COMMAND_TOPIC_2}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should subscribe for "${SUBSCRIPTION_NOTIFICATION_TOPIC_1}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${SUBSCRIPTION_NOTIFICATION_TOPIC_1}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should subscribe for "${SUBSCRIPTION_NOTIFICATION_TOPIC_2}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${SUBSCRIPTION_NOTIFICATION_TOPIC_2}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should query the list of command subscriptions for the user login: "${TEST_LOGIN}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(LIST_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.subscriptions).to.be.an(`object`);
                expect(Object.entries(message.subscriptions).map(([subscriptionId, subscriptionObject]) => {
                    return subscriptionObject.deviceIds[0];
                })).to.include.members([DEVICE_ID]);
                expect(Object.entries(message.subscriptions).map(([subscriptionId, subscriptionObject]) => {
                    return subscriptionObject.names[0];
                })).to.include.members([`${TEST_NAME}1`, `${TEST_NAME}1`]);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: LIST_ACTION,
            requestId: requestId,
            type: SUBSCRIPTION_COMMAND_TYPE
        }));
    });
});

it(`should query the list of notification subscriptions for the user login: "${TEST_LOGIN}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(LIST_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.subscriptions).to.be.an(`object`);
                expect(Object.entries(message.subscriptions).map(([subscriptionId, subscriptionObject]) => {
                    return subscriptionObject.deviceIds[0];
                })).to.include.members([DEVICE_ID]);
                expect(Object.entries(message.subscriptions).map(([subscriptionId, subscriptionObject]) => {
                    return subscriptionObject.names[0];
                })).to.include.members([`${TEST_NAME}1`, `${TEST_NAME}1`]);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: LIST_ACTION,
            requestId: requestId,
            type: SUBSCRIPTION_NOTIFICATION_TYPE
        }));
    });
});

it(`should disconnect from MQTT broker`, () => {
    return new Promise((resolve) => {
        mqttClient.end(() => {
            resolve();
        });
    });
});