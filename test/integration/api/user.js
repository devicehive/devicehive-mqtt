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
const SUBJECT = `user`;
const GET_OPERATION = `get`;
const LIST_OPERATION = `list`;
const INSERT_OPERATION = `insert`;
const UPDATE_OPERATION = `update`;
const DELETE_OPERATION = `delete`;
const GET_CURRENT_OPERATION = `getCurrent`;
const UPDATE_CURRENT_OPERATION = `updateCurrent`;
const GET_NETWORK_OPERATION = `getNetwork`;
const ASSIGN_NETWORK_OPERATION = `assignNetwork`;
const UNASSIGN_NETWORK_OPERATION = `unassignNetwork`;
const GET_ACTION = `${SUBJECT}/${GET_OPERATION}`;
const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
const INSERT_ACTION = `${SUBJECT}/${INSERT_OPERATION}`;
const UPDATE_ACTION = `${SUBJECT}/${UPDATE_OPERATION}`;
const DELETE_ACTION = `${SUBJECT}/${DELETE_OPERATION}`;
const GET_CURRENT_ACTION = `${SUBJECT}/${GET_CURRENT_OPERATION}`;
const UPDATE_CURRENT_ACTION = `${SUBJECT}/${UPDATE_CURRENT_OPERATION}`;
const GET_NETWORK_ACTION = `${SUBJECT}/${GET_NETWORK_OPERATION}`;
const ASSIGN_NETWORK_ACTION = `${SUBJECT}/${ASSIGN_NETWORK_OPERATION}`;
const UNASSIGN_NETWORK_ACTION = `${SUBJECT}/${UNASSIGN_NETWORK_OPERATION}`;
const GET_TOPIC = `${DH_RESPONSE_TOPIC}/${GET_ACTION}`;
const LIST_TOPIC = `${DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
const INSERT_TOPIC = `${DH_RESPONSE_TOPIC}/${INSERT_ACTION}`;
const UPDATE_TOPIC = `${DH_RESPONSE_TOPIC}/${UPDATE_ACTION}`;
const DELETE_TOPIC = `${DH_RESPONSE_TOPIC}/${DELETE_ACTION}`;
const GET_CURRENT_TOPIC = `${DH_RESPONSE_TOPIC}/${GET_CURRENT_ACTION}`;
const UPDATE_CURRENT_TOPIC = `${DH_RESPONSE_TOPIC}/${UPDATE_CURRENT_ACTION}`;
const GET_NETWORK_TOPIC = `${DH_RESPONSE_TOPIC}/${GET_NETWORK_ACTION}`;
const ASSIGN_NETWORK_TOPIC = `${DH_RESPONSE_TOPIC}/${ASSIGN_NETWORK_ACTION}`;
const UNASSIGN_NETWORK_TOPIC = `${DH_RESPONSE_TOPIC}/${UNASSIGN_NETWORK_ACTION}`;
const TEST_USER_LOGIN = `mqtt-broker-integration-tests-user-login`;
const TEST_USER_PASSWORD = `qwertyui`;
const START_USER_DATA = { data: `startData` };
const UPDATED_USER_DATA = { data: `updatedData` };
let mqttClient, testUserId;

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

it(`should subscribe for "${GET_CURRENT_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${GET_CURRENT_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should subscribe for "${UPDATE_CURRENT_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${UPDATE_CURRENT_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should subscribe for "${GET_NETWORK_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${GET_NETWORK_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should subscribe for "${ASSIGN_NETWORK_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${ASSIGN_NETWORK_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should subscribe for "${UNASSIGN_NETWORK_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(`${UNASSIGN_NETWORK_TOPIC}@${mqttClient.options.clientId}`, (err) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
});

it(`should create new user with login: "${TEST_USER_LOGIN}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(INSERT_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.user.id).to.be.a(`number`);

                testUserId = message.user.id;

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: INSERT_ACTION,
            requestId: requestId,
            user: {
                login: TEST_USER_LOGIN,
                role: 1,
                status: 0,
                password: TEST_USER_PASSWORD,
                oldPassword: TEST_USER_PASSWORD,
                data: START_USER_DATA,
                introReviewed: true
            }
        }));
    });
});

it(`should query the list of users with existing user with login: "${TEST_USER_LOGIN}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(LIST_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.users.map((userObject) => userObject.login))
                    .to.include.members([TEST_USER_LOGIN]);

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

it(`should query the users with login: "${TEST_USER_LOGIN}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.user.id).to.equal(testUserId);
                expect(message.user.login).to.equal(TEST_USER_LOGIN);
                expect(message.user.data).to.deep.equal(START_USER_DATA);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            userId: testUserId
        }));
    });
});

it(`should update the users data with login: "${TEST_USER_LOGIN}" from old data: "${JSON.stringify(START_USER_DATA)}" to new data: "${JSON.stringify(UPDATED_USER_DATA)}"`, () => {
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
            userId: testUserId,
            user: {
                data: UPDATED_USER_DATA
            }
        }));
    });
});

it(`should query the users with login: "${TEST_USER_LOGIN}" with updated data: "${JSON.stringify(UPDATED_USER_DATA)}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.user.id).to.equal(testUserId);
                expect(message.user.login).to.equal(TEST_USER_LOGIN);
                expect(message.user.data).to.deep.equal(UPDATED_USER_DATA);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_ACTION,
            requestId: requestId,
            userId: testUserId
        }));
    });
});

it(`should assign the user with login: "${TEST_USER_LOGIN}" to network with id "${NETWORK_ID}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(ASSIGN_NETWORK_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: ASSIGN_NETWORK_ACTION,
            requestId: requestId,
            userId: testUserId,
            networkId: NETWORK_ID
        }));
    });
});

it(`should query the network of the user with login: "${TEST_USER_LOGIN}" where the network id is: "${NETWORK_ID}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_NETWORK_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.network.network.id).to.equal(NETWORK_ID);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_NETWORK_ACTION,
            requestId: requestId,
            userId: testUserId,
            networkId: NETWORK_ID
        }));
    });
});

it(`should unassign the user with login: "${TEST_USER_LOGIN}" from network with id "${NETWORK_ID}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(UNASSIGN_NETWORK_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: UNASSIGN_NETWORK_ACTION,
            requestId: requestId,
            userId: testUserId,
            networkId: NETWORK_ID
        }));
    });
});

it(`should check that the user with login: "${TEST_USER_LOGIN}" is unassigned from the network with id: "${NETWORK_ID}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_NETWORK_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(ERROR_STATUS);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_NETWORK_ACTION,
            requestId: requestId,
            userId: testUserId,
            networkId: NETWORK_ID
        }));
    });
});

it(`should delete user with login: "${TEST_USER_LOGIN}"`, () => {
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
            userId: testUserId
        }));
    });
});

it(`should query the list of users without user with login: "${TEST_USER_LOGIN}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(LIST_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.users.map((userObject) => userObject.login))
                    .to.not.include.members([TEST_USER_LOGIN]);

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

it(`should query the current user with login: "${TEST_LOGIN}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_CURRENT_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.current.login).to.equal(TEST_LOGIN);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_CURRENT_ACTION,
            requestId: requestId
        }));
    });
});

it(`should update the current user data to: "${JSON.stringify(UPDATED_USER_DATA)} "`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(UPDATE_CURRENT_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: UPDATE_CURRENT_ACTION,
            requestId: requestId,
            user: {
                data: UPDATED_USER_DATA
            }
        }));
    });
});

it(`should query the updated current user with updated data: "${JSON.stringify(UPDATED_USER_DATA)}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(GET_CURRENT_OPERATION, (message) => {
            if (message.requestId === requestId) {
                expect(message.status).to.equal(SUCCESS_STATUS);
                expect(message.current.login).to.equal(TEST_LOGIN);
                expect(message.current.data).to.deep.equal(UPDATED_USER_DATA);

                resolve();
            }
        });

        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
            action: GET_CURRENT_ACTION,
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