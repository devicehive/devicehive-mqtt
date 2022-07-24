const CONST = require(`../constants.json`);
const Config = require(`../../config`).test.integration;
const mqtt = require(`mqtt`);
const EventEmitter = require("events");
const randomString = require(`randomstring`);
const chai = require(`chai`);
const expect = chai.expect;

const ee = new EventEmitter();

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
const GET_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${GET_ACTION}`;
const LIST_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
const INSERT_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${INSERT_ACTION}`;
const UPDATE_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${UPDATE_ACTION}`;
const DELETE_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${DELETE_ACTION}`;
const TEST_NETWORK_NAME = randomString.generate();
const TEST_NETWORK_DESCRIPTION = randomString.generate();
const UPDATED_TEST_NETWORK_DESCRIPTION = randomString.generate();
let mqttClient;
let testNetworkId;

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

it(`should subscribe for "${UPDATE_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(
            `${UPDATE_TOPIC}@${mqttClient.options.clientId}`,
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

it(`should subscribe for "${DELETE_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(
            `${DELETE_TOPIC}@${mqttClient.options.clientId}`,
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

it(`should create new network with name: "${TEST_NETWORK_NAME}" and description: "${TEST_NETWORK_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.network).to.be.an(`object`);

            testNetworkId = message.network.id;

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: INSERT_ACTION,
                requestId: requestId,
                network: {
                    name: TEST_NETWORK_NAME,
                    description: TEST_NETWORK_DESCRIPTION,
                },
            })
        );
    });
});

it(`should query the network name: "${TEST_NETWORK_NAME} and description: "${TEST_NETWORK_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.network).to.be.an(`object`);
            expect(message.network.id).to.equal(testNetworkId);
            expect(message.network.name).to.equal(TEST_NETWORK_NAME);
            expect(message.network.description).to.equal(
                TEST_NETWORK_DESCRIPTION
            );

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: GET_ACTION,
                requestId: requestId,
                networkId: testNetworkId,
            })
        );
    });
});

it(`should query the list of networks with existing network name: "${TEST_NETWORK_NAME} and description: "${TEST_NETWORK_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.networks).to.be.an(`array`);
            expect(
                message.networks.map((networkObject) => networkObject.id)
            ).to.include.members([testNetworkId]);
            expect(
                message.networks.map((networkObject) => networkObject.name)
            ).to.include.members([TEST_NETWORK_NAME]);
            expect(
                message.networks.map(
                    (networkObject) => networkObject.description
                )
            ).to.include.members([TEST_NETWORK_DESCRIPTION]);

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: LIST_ACTION,
                requestId: requestId,
                take: -1,
            })
        );
    });
});

it(`should update the network description: "${TEST_NETWORK_DESCRIPTION}" to "${UPDATED_TEST_NETWORK_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: UPDATE_ACTION,
                requestId: requestId,
                networkId: testNetworkId,
                network: {
                    description: UPDATED_TEST_NETWORK_DESCRIPTION,
                },
            })
        );
    });
});

it(`should query the updated network where updated description is: "${UPDATED_TEST_NETWORK_DESCRIPTION}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.network).to.be.an(`object`);
            expect(message.network.id).to.equal(testNetworkId);
            expect(message.network.name).to.equal(TEST_NETWORK_NAME);
            expect(message.network.description).to.equal(
                UPDATED_TEST_NETWORK_DESCRIPTION
            );

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: GET_ACTION,
                requestId: requestId,
                networkId: testNetworkId,
            })
        );
    });
});

it(`should delete the network"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: DELETE_ACTION,
                requestId: requestId,
                networkId: testNetworkId,
            })
        );
    });
});

it(`should query the list of the networks without deleted network`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message.networks).to.be.an(`array`);
            expect(
                message.networks.map((networkObject) => networkObject.id)
            ).to.not.include.members([testNetworkId]);

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: LIST_ACTION,
                requestId: requestId,
                networkId: Config.NETWORK_ID,
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
