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
const SUBJECT = `device`;
const GET_OPERATION = `get`;
const LIST_OPERATION = `list`;
const SAVE_OPERATION = `save`;
const DELETE_OPERATION = `delete`;
const GET_ACTION = `${SUBJECT}/${GET_OPERATION}`;
const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
const SAVE_ACTION = `${SUBJECT}/${SAVE_OPERATION}`;
const DELETE_ACTION = `${SUBJECT}/${DELETE_OPERATION}`;
const GET_TOPIC = `${DH_RESPONSE_TOPIC}/${GET_ACTION}`;
const LIST_TOPIC = `${DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
const SAVE_TOPIC = `${DH_RESPONSE_TOPIC}/${SAVE_ACTION}`;
const DELETE_TOPIC = `${DH_RESPONSE_TOPIC}/${DELETE_ACTION}`;
const DEVICE_1_ID = `mqtt-broker-integration-tests-device-1-id`;
const DEVICE_2_ID = `mqtt-broker-integration-tests-device-2-id`;
const DEVICE_1_NAME = `mqtt-broker-integration-tests-device-1-name`;
const DEVICE_2_NAME = `mqtt-broker-integration-tests-device-2-name`;
const DEVICE_1_NAME_UPDATED = `mqtt-broker-integration-tests-device-2-name-updated`;
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

it(`should subscribe for "${SAVE_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${SAVE_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should subscribe for "${DELETE_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${DELETE_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should create new device (1) with ID: "${DEVICE_1_ID}" and name: "${DEVICE_1_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(SAVE_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: SAVE_ACTION,
            requestId: requestId,
            deviceId: DEVICE_1_ID,
            device: {
                name: DEVICE_1_NAME,
                data: {},
                networkId: NETWORK_ID
            }
        }));
    });
});

it(`should create new device (2) with ID: "${DEVICE_2_ID}" and name: "${DEVICE_2_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(SAVE_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: SAVE_ACTION,
            requestId: requestId,
            deviceId: DEVICE_2_ID,
            device: {
                name: DEVICE_2_NAME,
                data: {},
                networkId: NETWORK_ID
            }
        }));
    });
});

it(`should query the device (1) with ID: "${DEVICE_1_ID}" and name: "${DEVICE_1_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.device).to.be.an(`object`);
                expect(message.device.id).to.equal(DEVICE_1_ID);
                expect(message.device.name).to.equal(DEVICE_1_NAME);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            deviceId: DEVICE_1_ID
        }));
    });
});

it(`should query the device (2) with ID: "${DEVICE_2_ID}" and name: "${DEVICE_2_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.device).to.be.an(`object`);
                expect(message.device.id).to.equal(DEVICE_2_ID);
                expect(message.device.name).to.equal(DEVICE_2_NAME);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            deviceId: DEVICE_2_ID
        }));
    });
});

it(`should query the list of devices with existing device (1) and device (2)`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(LIST_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.devices.map((deviceObject) => deviceObject.id))
                    .to.include.members([DEVICE_1_ID, DEVICE_2_ID]);
                expect(message.devices.map((deviceObject) => deviceObject.name))
                    .to.include.members([DEVICE_1_NAME, DEVICE_2_NAME]);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: LIST_ACTION,
            requestId: requestId,
            networkId: NETWORK_ID
        }));
    });
});

it(`should update the device (1) name: "${DEVICE_1_NAME}" to "${DEVICE_1_NAME_UPDATED}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(SAVE_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: SAVE_ACTION,
            requestId: requestId,
            deviceId: DEVICE_1_ID,
            device: {
                name: DEVICE_1_NAME_UPDATED,
                data: {},
                networkId: NETWORK_ID
            }
        }));
    });
});

it(`should query the updated device (1) with ID: "${DEVICE_2_ID}" and updated name: "${DEVICE_1_NAME_UPDATED}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.device).to.be.an(`object`);
                expect(message.device.id).to.equal(DEVICE_1_ID);
                expect(message.device.name).to.equal(DEVICE_1_NAME_UPDATED);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            deviceId: DEVICE_1_ID
        }));
    });
});

it(`should delete device (1) with ID: "${DEVICE_1_ID}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(DELETE_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: DELETE_ACTION,
            requestId: requestId,
            deviceId: DEVICE_1_ID
        }));
    });
});

it(`should delete device (2) with ID: "${DEVICE_2_ID}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(DELETE_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: DELETE_ACTION,
            requestId: requestId,
            deviceId: DEVICE_2_ID
        }));
    });
});

it(`should query the list of devices without device (1) and device (2)`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(LIST_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.devices.map((deviceObject) => deviceObject.id))
                    .to.not.include.members([DEVICE_1_ID, DEVICE_2_ID]);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: LIST_ACTION,
            requestId: requestId,
            networkId: NETWORK_ID
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