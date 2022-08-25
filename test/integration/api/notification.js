const CONST = require(`../constants.json`);
const Config = require(`../../config`).test.integration;
const mqtt = require(`mqtt`);
const EventEmitter = require("events");
const randomString = require(`randomstring`);
const chai = require(`chai`);
const expect = chai.expect;

const ee = new EventEmitter();

const SUBJECT = `notification`;
const GET_OPERATION = `get`;
const LIST_OPERATION = `list`;
const INSERT_OPERATION = `insert`;
const GET_ACTION = `${SUBJECT}/${GET_OPERATION}`;
const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
const INSERT_ACTION = `${SUBJECT}/${INSERT_OPERATION}`;
const GET_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${GET_ACTION}`;
const LIST_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
const INSERT_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${INSERT_ACTION}`;
const TEST_NOTIFICATION_NAME = randomString.generate();
const TEST_NOTIFICATION_PARAMETERS = { parameter: `startParameter` };
let mqttClient;
let testNotificationId;

it(`should connect to MQTT broker`, () => {
    return new Promise((resolve) => {
        mqttClient = mqtt.connect(Config.MQTT_BROKER_URL, {
            username: Config.TEST_LOGIN,
            password: Config.TEST_PASSWORD,
        });

        mqttClient.on(`message`, (topic, message) => {
            const messageObject = JSON.parse(message.toString());

            ee.emit(messageObject.requestId, messageObject);
        });

        mqttClient.on("connect", () => {
            resolve();
        });
    });
});

it(`should subscribe for "${GET_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(
            `${GET_TOPIC}@${mqttClient.options.clientId}`,
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
});

it(`should subscribe for "${LIST_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(
            `${LIST_TOPIC}@${mqttClient.options.clientId}`,
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
});

it(`should subscribe for "${INSERT_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(
            `${INSERT_TOPIC}@${mqttClient.options.clientId}`,
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
});

it(`should create new notification with name: "${TEST_NOTIFICATION_NAME}" for device with id: "${Config.DEVICE_ID}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.notification).to.be.an(`object`);

            testNotificationId = message.notification.id;

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: INSERT_ACTION,
                requestId: requestId,
                deviceId: Config.DEVICE_ID,
                notification: {
                    notification: TEST_NOTIFICATION_NAME,
                    parameters: TEST_NOTIFICATION_PARAMETERS,
                },
            })
        );
    });
});

it(`should query the notification with name: "${TEST_NOTIFICATION_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.notification).to.be.an(`object`);
            expect(message.notification.id).to.equal(testNotificationId);
            expect(message.notification.notification).to.equal(
                TEST_NOTIFICATION_NAME
            );
            expect(message.notification.deviceId).to.equal(Config.DEVICE_ID);
            expect(message.notification.parameters).to.deep.equal(
                TEST_NOTIFICATION_PARAMETERS
            );

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: GET_ACTION,
                requestId: requestId,
                deviceId: Config.DEVICE_ID,
                notificationId: testNotificationId,
            })
        );
    });
});

it(`should query the list of notifications for device with id: "${Config.DEVICE_ID}" with existing notification with name: "${TEST_NOTIFICATION_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.notifications).to.be.an(`array`);
            expect(
                message.notifications.map(
                    (notificationObject) => notificationObject.id
                )
            ).to.include.members([testNotificationId]);
            expect(
                message.notifications.map(
                    (notificationObject) => notificationObject.notification
                )
            ).to.include.members([TEST_NOTIFICATION_NAME]);

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: LIST_ACTION,
                requestId: requestId,
                deviceId: Config.DEVICE_ID,
                take: 1000,
            })
        );
    });
});

it(`should disconnect from MQTT broker`, () => {
    return new Promise((resolve) => {
        mqttClient.end(() => {
            resolve();
        });
    });
});
