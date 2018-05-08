const CONST = require(`../constants.json`);
const Config = require(`../../config`).test.integration;
const mqtt = require(`mqtt`);
const EventEmitter = require('events');
const randomString = require(`randomstring`);
const chai = require(`chai`);
const expect = chai.expect;

const ee = new EventEmitter();

const SUBJECT = `subscription`;
const LIST_OPERATION = `list`;
const TEST_NAME = `testName`;
const SUBSCRIPTION_COMMAND_TYPE = `command`;
const SUBSCRIPTION_NOTIFICATION_TYPE = `notification`;
const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
const LIST_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
const SUBSCRIPTION_COMMAND_TOPIC_1 = `dh/${SUBSCRIPTION_COMMAND_TYPE}/${Config.NETWORK_ID}/${Config.DEVICE_TYPE_ID}/${Config.DEVICE_ID}/${TEST_NAME}1`;
const SUBSCRIPTION_COMMAND_TOPIC_2 = `dh/${SUBSCRIPTION_COMMAND_TYPE}/${Config.NETWORK_ID}/${Config.DEVICE_TYPE_ID}/${Config.DEVICE_ID}/${TEST_NAME}2`;
const SUBSCRIPTION_NOTIFICATION_TOPIC_1 = `dh/${SUBSCRIPTION_NOTIFICATION_TYPE}/${Config.NETWORK_ID}/${Config.DEVICE_TYPE_ID}/${Config.DEVICE_ID}/${TEST_NAME}1`;
const SUBSCRIPTION_NOTIFICATION_TOPIC_2 = `dh/${SUBSCRIPTION_NOTIFICATION_TYPE}/${Config.NETWORK_ID}/${Config.DEVICE_TYPE_ID}/${Config.DEVICE_ID}/${TEST_NAME}2`;
let mqttClient;

it(`should connect to MQTT broker`, () => {
    return new Promise((resolve) => {
        mqttClient = mqtt.connect(Config.MQTT_BROKER_URL, {
            username: Config.TEST_LOGIN,
            password: Config.TEST_PASSWORD
        });

        mqttClient.on(`message`, (topic, message) => {
            const messageObject = JSON.parse(message.toString());

            ee.emit(messageObject.requestId, messageObject);
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

it(`should query the list of command subscriptions for the user login: "${Config.TEST_LOGIN}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.subscriptions).to.be.an(`array`);
            expect(message.subscriptions.map((subscriptionObject) => {
                return subscriptionObject.deviceId;
            })).to.include.members([Config.DEVICE_ID]);
            expect(message.subscriptions.map((subscriptionObject) => {
                return subscriptionObject.names[0];
            })).to.include.members([`${TEST_NAME}1`, `${TEST_NAME}2`]);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: LIST_ACTION,
            requestId: requestId,
            type: SUBSCRIPTION_COMMAND_TYPE
        }));
    });
});

it(`should query the list of notification subscriptions for the user login: "${Config.TEST_LOGIN}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.subscriptions).to.be.an(`array`);
            expect(message.subscriptions.map((subscriptionObject) => {
                return subscriptionObject.deviceId;
            })).to.include.members([Config.DEVICE_ID]);
            expect(message.subscriptions.map((subscriptionObject) => {
                return subscriptionObject.names[0];
            })).to.include.members([`${TEST_NAME}1`, `${TEST_NAME}2`]);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
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