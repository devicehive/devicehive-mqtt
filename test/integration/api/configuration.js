const CONST = require(`../constants.json`);
const Config = require(`../../config`).test.integration;
const mqtt = require(`mqtt`);
const EventEmitter = require('events');
const randomString = require(`randomstring`);
const chai = require(`chai`);
const expect = chai.expect;

const ee = new EventEmitter();

const SUBJECT = `configuration`;
const GET_OPERATION = `get`;
const PUT_OPERATION = `put`;
const DELETE_OPERATION = `delete`;
const GET_ACTION = `${SUBJECT}/${GET_OPERATION}`;
const PUT_ACTION = `${SUBJECT}/${PUT_OPERATION}`;
const DELETE_ACTION = `${SUBJECT}/${DELETE_OPERATION}`;
const GET_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${GET_ACTION}`;
const PUT_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${PUT_ACTION}`;
const DELETE_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${DELETE_ACTION}`;
const TEST_CONFIGURATION_NAME = randomString.generate();
const START_TEST_CONFIGURATION_VALUE = randomString.generate();
const UPDATED_TEST_CONFIGURATION_VALUE = randomString.generate();
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
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.configuration).to.be.an(`object`);
            expect(message.configuration.name).to.equal(TEST_CONFIGURATION_NAME);
            expect(message.configuration.value).to.equal(START_TEST_CONFIGURATION_VALUE);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
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
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.configuration).to.be.an(`object`);
            expect(message.configuration.name).to.equal(TEST_CONFIGURATION_NAME);
            expect(message.configuration.value).to.equal(START_TEST_CONFIGURATION_VALUE);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            name: TEST_CONFIGURATION_NAME
        }));
    });
});

it(`should update configuration with name: "${TEST_CONFIGURATION_NAME}" by new value: "${UPDATED_TEST_CONFIGURATION_VALUE}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.configuration).to.be.an(`object`);
            expect(message.configuration.name).to.equal(TEST_CONFIGURATION_NAME);
            expect(message.configuration.value).to.equal(UPDATED_TEST_CONFIGURATION_VALUE);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
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
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.configuration).to.be.an(`object`);
            expect(message.configuration.name).to.equal(TEST_CONFIGURATION_NAME);
            expect(message.configuration.value).to.equal(UPDATED_TEST_CONFIGURATION_VALUE);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            name: TEST_CONFIGURATION_NAME
        }));
    });
});

it(`should delete configuration with name: "${TEST_CONFIGURATION_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: DELETE_ACTION,
            requestId: requestId,
            name: TEST_CONFIGURATION_NAME
        }));
    });
});

it(`should check that configuration with name: "${TEST_CONFIGURATION_NAME}" has been deleted`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.ERROR_STATUS);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
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