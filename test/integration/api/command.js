const CONST = require(`../constants.json`);
const Config = require(`../../config`).test.integration;
const mqtt = require(`mqtt`);
const EventEmitter = require('events');
const randomString = require(`randomstring`);
const chai = require(`chai`);
const expect = chai.expect;

const ee = new EventEmitter();

const SUBJECT = `command`;
const GET_OPERATION = `get`;
const LIST_OPERATION = `list`;
const INSERT_OPERATION = `insert`;
const UPDATE_OPERATION = `update`;
const GET_ACTION = `${SUBJECT}/${GET_OPERATION}`;
const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
const INSERT_ACTION = `${SUBJECT}/${INSERT_OPERATION}`;
const UPDATE_ACTION = `${SUBJECT}/${UPDATE_OPERATION}`;
const GET_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${GET_ACTION}`;
const LIST_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
const INSERT_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${INSERT_ACTION}`;
const UPDATE_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${UPDATE_ACTION}`;
const TEST_COMMAND_NAME = randomString.generate();
const START_TEST_COMMAND_PARAMETERS = { parameter: `startParameter` };
const UPDATED_TEST_COMMAND_PARAMETERS = { parameter: `updatedParameter` };
const COMMAND_LIFETIME = 20;
let mqttClient, testCommandId;

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

it(`should create new command with name: "${TEST_COMMAND_NAME}" for device with id: "${Config.DEVICE_ID}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.command).to.be.an(`object`);

            testCommandId = message.command.id;

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: INSERT_ACTION,
            requestId: requestId,
            deviceId: Config.DEVICE_ID,
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
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.command).to.be.an(`object`);
            expect(message.command.id).to.equal(testCommandId);
            expect(message.command.command).to.equal(TEST_COMMAND_NAME);
            expect(message.command.deviceId).to.equal(Config.DEVICE_ID);
            expect(message.command.parameters).to.deep.equal(START_TEST_COMMAND_PARAMETERS);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            deviceId: Config.DEVICE_ID,
            commandId: testCommandId
        }));
    });
});

it(`should query the list of command for device with id: "${Config.DEVICE_ID}" with existing command with name: "${TEST_COMMAND_NAME}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.commands).to.be.an(`array`);
            expect(message.commands.map((commandObject) => commandObject.id))
                .to.include.members([testCommandId]);
            expect(message.commands.map((commandObject) => commandObject.command))
                .to.include.members([TEST_COMMAND_NAME]);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: LIST_ACTION,
            requestId: requestId,
            deviceId: Config.DEVICE_ID,
            take: 1000
        }));
    });
});

it(`should update the command parameters: "${JSON.stringify(START_TEST_COMMAND_PARAMETERS)}" to "${JSON.stringify(UPDATED_TEST_COMMAND_PARAMETERS)}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: UPDATE_ACTION,
            requestId: requestId,
            deviceId: Config.DEVICE_ID,
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
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.command).to.be.an(`object`);
            expect(message.command.id).to.equal(testCommandId);
            expect(message.command.command).to.equal(TEST_COMMAND_NAME);
            expect(message.command.deviceId).to.equal(Config.DEVICE_ID);
            expect(message.command.parameters).to.deep.equal(UPDATED_TEST_COMMAND_PARAMETERS);

            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            deviceId: Config.DEVICE_ID,
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
