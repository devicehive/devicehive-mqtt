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
const SUBJECT = `command`;
const GET_OPERATION = `get`;
const LIST_OPERATION = `list`;
const INSERT_OPERATION = `insert`;
const UPDATE_OPERATION = `update`;
const GET_ACTION = `${SUBJECT}/${GET_OPERATION}`;
const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
const INSERT_ACTION = `${SUBJECT}/${INSERT_OPERATION}`;
const UPDATE_ACTION = `${SUBJECT}/${UPDATE_OPERATION}`;
const GET_TOPIC = `${DH_RESPONSE_TOPIC}/${GET_ACTION}`;
const LIST_TOPIC = `${DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
const INSERT_TOPIC = `${DH_RESPONSE_TOPIC}/${INSERT_ACTION}`;
const UPDATE_TOPIC = `${DH_RESPONSE_TOPIC}/${UPDATE_ACTION}`;
const TEST_COMMAND_NAME = `mqtt-broker-integration-tests-command-name`;
const START_TEST_COMMAND_PARAMETERS = { parameter: `startParameter` };
const UPDATED_TEST_COMMAND_PARAMETERS = { parameter: `updatedParameter` };
const COMMAND_LIFETIME = 20;
let mqttClient, testCommandId;

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

it(`should subscribe for "${UPDATE_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${UPDATE_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should create new command with name: "${TEST_COMMAND_NAME}" for device with id: "${DEVICE_ID}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(INSERT_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.command).to.be.an(`object`);

                testCommandId = message.command.id;

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: INSERT_ACTION,
            requestId: requestId,
            deviceId: DEVICE_ID,
            command: {
                command: TEST_COMMAND_NAME,
                parameters: START_TEST_COMMAND_PARAMETERS,
                lifetime: COMMAND_LIFETIME
            }
        }));
    });
});

it(`should query the command with name: "${TEST_COMMAND_NAME}" and parameters: "${JSON.stringify(START_TEST_COMMAND_PARAMETERS)}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.command).to.be.an(`object`);
                expect(message.command.id).to.equal(testCommandId);
                expect(message.command.command).to.equal(TEST_COMMAND_NAME);
                expect(message.command.deviceId).to.equal(DEVICE_ID);
                expect(message.command.parameters).to.deep.equal(START_TEST_COMMAND_PARAMETERS);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            deviceId: DEVICE_ID,
            commandId: testCommandId
        }));
    });
});

it(`should query the list of command for device with id: "${DEVICE_ID}" with existing command with name: "${TEST_COMMAND_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(LIST_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.commands).to.be.an(`array`);
                expect(message.commands.map((commandObject) => commandObject.id))
                    .to.include.members([testCommandId]);
                expect(message.commands.map((commandObject) => commandObject.command))
                    .to.include.members([TEST_COMMAND_NAME]);

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

it(`should update the command parameters: "${JSON.stringify(START_TEST_COMMAND_PARAMETERS)}" to "${JSON.stringify(UPDATED_TEST_COMMAND_PARAMETERS)}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(UPDATE_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: UPDATE_ACTION,
            requestId: requestId,
            deviceId: DEVICE_ID,
            commandId: testCommandId,
            command: {
                parameters: UPDATED_TEST_COMMAND_PARAMETERS
            }
        }));
    });
});

it(`should query the updated command where updated parameters are: "${JSON.stringify(UPDATED_TEST_COMMAND_PARAMETERS)}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.command).to.be.an(`object`);
                expect(message.command.id).to.equal(testCommandId);
                expect(message.command.command).to.equal(TEST_COMMAND_NAME);
                expect(message.command.deviceId).to.equal(DEVICE_ID);
                expect(message.command.parameters).to.deep.equal(UPDATED_TEST_COMMAND_PARAMETERS);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            deviceId: DEVICE_ID,
            commandId: testCommandId
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
