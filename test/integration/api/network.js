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
const SUBJECT = `network`;
const GET_OPERATION = `get`;
const LIST_OPERATION = `list`;
const INSERT_OPERATION = `insert`;
const UPDATE_OPERATION = `update`;
const DELETE_OPERATION = `delete`;
const GET_ACTION = `${SUBJECT}/${GET_OPERATION}`;
const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
const INSERT_ACTION = `${SUBJECT}/${INSERT_OPERATION}`;
const UPDATE_ACTION = `${SUBJECT}/${UPDATE_OPERATION}`;
const DELETE_ACTION = `${SUBJECT}/${DELETE_OPERATION}`;
const GET_TOPIC = `${DH_RESPONSE_TOPIC}/${GET_ACTION}`;
const LIST_TOPIC = `${DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
const INSERT_TOPIC = `${DH_RESPONSE_TOPIC}/${INSERT_ACTION}`;
const UPDATE_TOPIC = `${DH_RESPONSE_TOPIC}/${UPDATE_ACTION}`;
const DELETE_TOPIC = `${DH_RESPONSE_TOPIC}/${DELETE_ACTION}`;
const TEST_NETWORK_NAME = `mqtt-broker-integration-tests-network-name`;
const TEST_NETWORK_DESCRIPTION = `mqtt-broker-integration-tests-network-description`;
const UPDATED_TEST_NETWORK_DESCRIPTION = `mqtt-broker-integration-tests-network-description-updated`;
let mqttClient, testNetworkId;

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

it(`should create new network with name: "${TEST_NETWORK_NAME}" and description: "${TEST_NETWORK_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(INSERT_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.network).to.be.an(`object`);

                testNetworkId = message.network.id;

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: INSERT_ACTION,
            requestId: requestId,
            network: {
                name: TEST_NETWORK_NAME,
                description: TEST_NETWORK_DESCRIPTION
            }
        }));
    });
});

it(`should query the network name: "${TEST_NETWORK_NAME} and description: "${TEST_NETWORK_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.network).to.be.an(`object`);
                expect(message.network.id).to.equal(testNetworkId);
                expect(message.network.name).to.equal(TEST_NETWORK_NAME);
                expect(message.network.description).to.equal(TEST_NETWORK_DESCRIPTION);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            networkId: testNetworkId
        }));
    });
});

it(`should query the list of networks with existing network name: "${TEST_NETWORK_NAME} and description: "${TEST_NETWORK_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(LIST_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.networks).to.be.an(`array`);
                expect(message.networks.map((networkObject) => networkObject.id))
                    .to.include.members([testNetworkId]);
                expect(message.networks.map((networkObject) => networkObject.name))
                    .to.include.members([TEST_NETWORK_NAME]);
                expect(message.networks.map((networkObject) => networkObject.description))
                    .to.include.members([TEST_NETWORK_DESCRIPTION]);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: LIST_ACTION,
            requestId: requestId,
            take: -1
        }));
    });
});

it(`should update the network description: "${TEST_NETWORK_DESCRIPTION}" to "${UPDATED_TEST_NETWORK_DESCRIPTION}"`, () => {
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
            networkId: testNetworkId,
            network: {
                description: UPDATED_TEST_NETWORK_DESCRIPTION
            }
        }));
    });
});

it(`should query the updated network where updated description is: "${UPDATED_TEST_NETWORK_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.network).to.be.an(`object`);
                expect(message.network.id).to.equal(testNetworkId);
                expect(message.network.name).to.equal(TEST_NETWORK_NAME);
                expect(message.network.description).to.equal(UPDATED_TEST_NETWORK_DESCRIPTION);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            networkId: testNetworkId
        }));
    });
});

it(`should delete the network"`, () => {
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
            networkId: testNetworkId
        }));
    });
});

it(`should query the list of the networks without deleted network`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(LIST_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.networks).to.be.an(`array`);
                expect(message.networks.map((networkObject) => networkObject.id))
                    .to.not.include.members([testNetworkId]);

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
