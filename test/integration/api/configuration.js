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
const SUBJECT = `configuration`;
const GET_OPERATION = `get`;
const PUT_OPERATION = `put`;
const DELETE_OPERATION = `delete`;
const GET_ACTION = `${SUBJECT}/${GET_OPERATION}`;
const PUT_ACTION = `${SUBJECT}/${PUT_OPERATION}`;
const DELETE_ACTION = `${SUBJECT}/${DELETE_OPERATION}`;
const GET_TOPIC = `${DH_RESPONSE_TOPIC}/${GET_ACTION}`;
const PUT_TOPIC = `${DH_RESPONSE_TOPIC}/${PUT_ACTION}`;
const DELETE_TOPIC = `${DH_RESPONSE_TOPIC}/${DELETE_ACTION}`;
const TEST_CONFIGURATION_NAME = `mqttTestsConfigurationName`;
const START_TEST_CONFIGURATION_VALUE = `mqttTestsConfigurationValue`;
const UPDATED_TEST_CONFIGURATION_VALUE = `mqttTestsConfigurationValueUpdated`;
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

it(`should subscribe for "${PUT_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${PUT_TOPIC}@${mqttClient.options.clientId}`, (err) => {
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

it(`should put new configuration with name: "${TEST_CONFIGURATION_NAME}" and value: "${START_TEST_CONFIGURATION_VALUE}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(PUT_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.configuration).to.be.an(`object`);
                expect(message.configuration.name).to.equal(TEST_CONFIGURATION_NAME);
                expect(message.configuration.value).to.equal(START_TEST_CONFIGURATION_VALUE);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: PUT_ACTION,
            requestId: requestId,
            name: TEST_CONFIGURATION_NAME,
            value: START_TEST_CONFIGURATION_VALUE
        }));
    });
});

it(`should query configuration with name: "${TEST_CONFIGURATION_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.configuration).to.be.an(`object`);
                expect(message.configuration.name).to.equal(TEST_CONFIGURATION_NAME);
                expect(message.configuration.value).to.equal(START_TEST_CONFIGURATION_VALUE);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            name: TEST_CONFIGURATION_NAME
        }));
    });
});

it(`should update configuration with name: "${TEST_CONFIGURATION_NAME}" by new value: "${UPDATED_TEST_CONFIGURATION_VALUE}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(PUT_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.configuration).to.be.an(`object`);
                expect(message.configuration.name).to.equal(TEST_CONFIGURATION_NAME);
                expect(message.configuration.value).to.equal(UPDATED_TEST_CONFIGURATION_VALUE);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: PUT_ACTION,
            requestId: requestId,
            name: TEST_CONFIGURATION_NAME,
            value: UPDATED_TEST_CONFIGURATION_VALUE
        }));
    });
});

it(`should query updated configuration with name: "${TEST_CONFIGURATION_NAME}" and value: "${UPDATED_TEST_CONFIGURATION_VALUE}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.configuration).to.be.an(`object`);
                expect(message.configuration.name).to.equal(TEST_CONFIGURATION_NAME);
                expect(message.configuration.value).to.equal(UPDATED_TEST_CONFIGURATION_VALUE);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            name: TEST_CONFIGURATION_NAME
        }));
    });
});

it(`should delete configuration with name: "${TEST_CONFIGURATION_NAME}"`, () => {
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
            name: TEST_CONFIGURATION_NAME
        }));
    });
});

it(`should check that configuration with name: "${TEST_CONFIGURATION_NAME}" has been deleted`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(ERROR_STATUS);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId
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