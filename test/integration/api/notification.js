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
const SUBJECT = `notification`;
const GET_OPERATION = `get`;
const LIST_OPERATION = `list`;
const INSERT_OPERATION = `insert`;
const GET_ACTION = `${SUBJECT}/${GET_OPERATION}`;
const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
const INSERT_ACTION = `${SUBJECT}/${INSERT_OPERATION}`;
const GET_TOPIC = `${DH_RESPONSE_TOPIC}/${GET_ACTION}`;
const LIST_TOPIC = `${DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
const INSERT_TOPIC = `${DH_RESPONSE_TOPIC}/${INSERT_ACTION}`;
const TEST_NOTIFICATION_NAME = `mqtt-broker-integration-tests-notification-name`;
const TEST_NOTIFICATION_PARAMETERS = { parameter: `startParameter` };
let mqttClient, testNotificationId;

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

it(`should subscribe for "${GET_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${GET_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
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

it(`should subscribe for "${INSERT_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${INSERT_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should create new notification with name: "${TEST_NOTIFICATION_NAME}" for device with id: "${DEVICE_ID}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(INSERT_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.notification).to.be.an(`object`);

                testNotificationId = message.notification.id;

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: INSERT_ACTION,
            requestId: requestId,
            deviceId: DEVICE_ID,
            notification: {
                notification: TEST_NOTIFICATION_NAME,
                parameters: TEST_NOTIFICATION_PARAMETERS
            }
        }));
    });
});

it(`should query the notification with name: "${TEST_NOTIFICATION_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.notification).to.be.an(`object`);
                expect(message.notification.id).to.equal(testNotificationId);
                expect(message.notification.notification).to.equal(TEST_NOTIFICATION_NAME);
                expect(message.notification.deviceId).to.equal(DEVICE_ID);
                expect(message.notification.parameters).to.deep.equal(TEST_NOTIFICATION_PARAMETERS);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            deviceId: DEVICE_ID,
            notificationId: testNotificationId
        }));
    });
});

it(`should query the list of notifications for device with id: "${DEVICE_ID}" with existing notification with name: "${TEST_NOTIFICATION_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(LIST_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.notifications).to.be.an(`array`);
                expect(message.notifications.map((notificationObject) => notificationObject.id))
                    .to.include.members([testNotificationId]);
                expect(message.notifications.map((notificationObject) => notificationObject.notification))
                    .to.include.members([TEST_NOTIFICATION_NAME]);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: LIST_ACTION,
            requestId: requestId,
            deviceId: DEVICE_ID,
            take: 1000
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