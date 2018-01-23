const CONST = require(`../constants.json`);
const Config = require(`../../config`).test.integration;
const mqtt = require(`mqtt`);
const EventEmitter = require('events');
const randomString = require(`randomstring`);
const chai = require(`chai`);
const expect = chai.expect;

const ee = new EventEmitter();

const SUBJECT = `devicetype`;
const LIST_OPERATION = `list`;
const COUNT_OPERATION = `count`;
const GET_OPERATION = `get`;
const INSERT_OPERATION = `insert`;
const UPDATE_OPERATION = `update`;
const DELETE_OPERATION = `delete`;
const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
const COUNT_ACTION = `${SUBJECT}/${COUNT_OPERATION}`;
const GET_ACTION = `${SUBJECT}/${GET_OPERATION}`;
const INSERT_ACTION = `${SUBJECT}/${INSERT_OPERATION}`;
const UPDATE_ACTION = `${SUBJECT}/${UPDATE_OPERATION}`;
const DELETE_ACTION = `${SUBJECT}/${DELETE_OPERATION}`;
const LIST_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
const COUNT_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${COUNT_ACTION}`;
const GET_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${GET_ACTION}`;
const INSERT_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${INSERT_ACTION}`;
const UPDATE_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${UPDATE_ACTION}`;
const DELETE_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${DELETE_ACTION}`;
const TEST_DEVICE_TYPE_NAME = randomString.generate();
const TEST_DEVICE_TYPE_DESCRIPTION = randomString.generate();
const TEST_DEVICE_TYPE_NEW_DESCRIPTION = randomString.generate();
let deviceTypeCount = 0;
let mqttClient, customDeviceTypeId;

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
        return mqttClient.subscribe(`${LIST_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            return err ? reject() : resolve();
        })
    });
});

it(`should subscribe for "${COUNT_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        return mqttClient.subscribe(`${COUNT_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            return err ? reject() : resolve();
        })
    });
});

it(`should subscribe for "${GET_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        return mqttClient.subscribe(`${GET_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            return err ? reject() : resolve();
        })
    });
});

it(`should subscribe for "${INSERT_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        return mqttClient.subscribe(`${INSERT_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            return err ? reject() : resolve();
        })
    });
});

it(`should subscribe for "${UPDATE_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        return mqttClient.subscribe(`${UPDATE_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            return err ? reject() : resolve();
        })
    });
});

it(`should subscribe for "${DELETE_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        return mqttClient.subscribe(`${DELETE_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            return err ? reject() : resolve();
        })
    });
});

it(`should get count of existing device types`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.count).to.be.a(`number`);
            deviceTypeCount = message.count;
            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: COUNT_ACTION,
            requestId: requestId
        }));
    });
});

it(`should create new device type with name: "${TEST_DEVICE_TYPE_NAME}" and description: "${TEST_DEVICE_TYPE_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.deviceType.id).to.be.a(`number`);
            customDeviceTypeId = message.deviceType.id;
            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: INSERT_ACTION,
            requestId: requestId,
            deviceType: {
                name: TEST_DEVICE_TYPE_NAME,
                description: TEST_DEVICE_TYPE_DESCRIPTION
            }
        }));
    });
});

it(`should get new count of existing device types increased by 1`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.count).to.be.a(`number`);
            expect(message.count).to.equal(deviceTypeCount + 1);
            deviceTypeCount = message.count;
            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: COUNT_ACTION,
            requestId: requestId
        }));
    });
});

it(`should query the device type with name: "${TEST_DEVICE_TYPE_NAME}" and description: "${TEST_DEVICE_TYPE_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.deviceTypes).to.be.an(`array`);
            expect(message.deviceTypes[0].id).to.equal(customDeviceTypeId);
            expect(message.deviceTypes[0].name).to.equal(TEST_DEVICE_TYPE_NAME);
            expect(message.deviceTypes[0].description).to.equal(TEST_DEVICE_TYPE_DESCRIPTION);
            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: LIST_ACTION,
            requestId: requestId,
            name: TEST_DEVICE_TYPE_NAME
        }));
    });
});

it(`should update device type with name: "${TEST_DEVICE_TYPE_NAME}" to new description: "${TEST_DEVICE_TYPE_NEW_DESCRIPTION}"`, () => {
    const requestId1 = randomString.generate();
    const requestId2 = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId1, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);

            mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                action: GET_ACTION,
                requestId: requestId2,
                deviceTypeId: customDeviceTypeId
            }));
        });

        ee.once(requestId2, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.deviceType).to.be.an(`object`);
            expect(message.deviceType.id).to.equal(customDeviceTypeId);
            expect(message.deviceType.name).to.equal(TEST_DEVICE_TYPE_NAME);
            expect(message.deviceType.description).to.equal(TEST_DEVICE_TYPE_NEW_DESCRIPTION);
            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: UPDATE_ACTION,
            requestId: requestId1,
            deviceTypeId: customDeviceTypeId,
            deviceType: {
                name: TEST_DEVICE_TYPE_NAME,
                description: TEST_DEVICE_TYPE_NEW_DESCRIPTION
            }
        }));
    });
});

it(`should delete the device type with name: "${TEST_DEVICE_TYPE_NAME}" and description: "${TEST_DEVICE_TYPE_NEW_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            resolve();
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            deviceTypeId: customDeviceTypeId
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