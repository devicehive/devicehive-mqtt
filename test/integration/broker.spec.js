const EventEmitter = require('events');
const randomString = require(`randomstring`);
const sinon = require(`sinon`);
const chai = require(`chai`);
const expect = chai.expect;
const assert = chai.assert;

const mqtt = require(`mqtt`);

describe(`MQTT broker (should bu ran on localhost:1883)`, () => {
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


    describe(`User API`, () => {
        const ee = new EventEmitter();
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
    });

    describe(`Configuration API`, () => {
        const ee = new EventEmitter();
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
    });

    describe(`Device API`, () => {
        const ee = new EventEmitter();
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
    });

    describe(`Network API`, () => {
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
    });

    describe(`Command API`, () => {
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
    });

    describe(`Notification API`, () => {
        const ee = new EventEmitter();
        const SUBJECT = `notification`;
        const GET_OPERATION = `get`;
        const LIST_OPERATION = `list`;
        const INSERT_OPERATION = `insert`;
        const GET_ACTION = `${SUBJECT}/${GET_OPERATION}`;
        const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
        const INSERT_ACTION = `${SUBJECT}/${INSERT_OPERATION}`;
        const GET_TOPIC = `${DH_RESPONSE_TOPIC}/${GET_ACTION}`;
        const LIST_TOPIC = `${DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
        const INSERT_TOPIC = `${DH_RESPONSE_TOPIC}/${INSERT_ACTION}`;
        const TEST_NOTIFICATION_NAME = `mqtt-broker-integration-tests-notification-name`;
        const TEST_NOTIFICATION_PARAMETERS = { parameter: `startParameter` };
        let mqttClient, testNotificationId;

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

        it(`should create new notification with name: "${TEST_NOTIFICATION_NAME}" for device with id: "${DEVICE_ID}"`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(INSERT_OPERATION, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(SUCCESS_STATUS);
                        expect(message.notification).to.be.an(`object`);

                        testNotificationId = message.notification.id;

                        resolve();
                    }
                });

                mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                    action: INSERT_ACTION,
                    requestId: requestId,
                    deviceId: DEVICE_ID,
                    notification: {
                        notification: TEST_NOTIFICATION_NAME,
                        parameters: TEST_NOTIFICATION_PARAMETERS
                    }
                }));
            });
        });

        it(`should query the notification with name: "${TEST_NOTIFICATION_NAME}"`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(GET_OPERATION, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(SUCCESS_STATUS);
                        expect(message.notification).to.be.an(`object`);
                        expect(message.notification.id).to.equal(testNotificationId);
                        expect(message.notification.notification).to.equal(TEST_NOTIFICATION_NAME);
                        expect(message.notification.deviceId).to.equal(DEVICE_ID);
                        expect(message.notification.parameters).to.deep.equal(TEST_NOTIFICATION_PARAMETERS);

                        resolve();
                    }
                });

                mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                    action: GET_ACTION,
                    requestId: requestId,
                    deviceId: DEVICE_ID,
                    notificationId: testNotificationId
                }));
            });
        });

        it(`should query the list of notifications for device with id: "${DEVICE_ID}" with existing notification with name: "${TEST_NOTIFICATION_NAME}"`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(LIST_OPERATION, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(SUCCESS_STATUS);
                        expect(message.notifications).to.be.an(`array`);
                        expect(message.notifications.map((notificationObject) => notificationObject.id))
                            .to.include.members([testNotificationId]);
                        expect(message.notifications.map((notificationObject) => notificationObject.notification))
                            .to.include.members([TEST_NOTIFICATION_NAME]);

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

        it(`should disconnect from MQTT broker`, () => {
            return new Promise((resolve) => {
                mqttClient.end(() => {
                    resolve();
                });
            });
        });
    });

    describe(`Subscription API`, () => {
        const ee = new EventEmitter();
        const SUBJECT = `subscription`;
        const LIST_OPERATION = `list`;
        const LIST_ACTION = `${SUBJECT}/${LIST_OPERATION}`;
        const LIST_TOPIC = `${DH_RESPONSE_TOPIC}/${LIST_ACTION}`;
        const TEST_NAME = `testName`;
        const SUBSCRIPTION_COMMAND_TYPE = `command`;
        const SUBSCRIPTION_NOTIFICATION_TYPE = `notification`;
        const SUBSCRIPTION_COMMAND_TOPIC_1 = `dh/${SUBSCRIPTION_COMMAND_TYPE}/${NETWORK_ID}/${DEVICE_ID}/${TEST_NAME}1`;
        const SUBSCRIPTION_COMMAND_TOPIC_2 = `dh/${SUBSCRIPTION_COMMAND_TYPE}/${NETWORK_ID}/${DEVICE_ID}/${TEST_NAME}2`;
        const SUBSCRIPTION_NOTIFICATION_TOPIC_1 = `dh/${SUBSCRIPTION_NOTIFICATION_TYPE}/${NETWORK_ID}/${DEVICE_ID}/${TEST_NAME}1`;
        const SUBSCRIPTION_NOTIFICATION_TOPIC_2 = `dh/${SUBSCRIPTION_NOTIFICATION_TYPE}/${NETWORK_ID}/${DEVICE_ID}/${TEST_NAME}2`;
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

        it(`should subscribe for "${SUBSCRIPTION_COMMAND_TOPIC_1}" topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`${SUBSCRIPTION_COMMAND_TOPIC_1}@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should subscribe for "${SUBSCRIPTION_COMMAND_TOPIC_2}" topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`${SUBSCRIPTION_COMMAND_TOPIC_2}@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should subscribe for "${SUBSCRIPTION_NOTIFICATION_TOPIC_1}" topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`${SUBSCRIPTION_NOTIFICATION_TOPIC_1}@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should subscribe for "${SUBSCRIPTION_NOTIFICATION_TOPIC_2}" topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`${SUBSCRIPTION_NOTIFICATION_TOPIC_2}@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should query the list of command subscriptions for the user login: "${TEST_LOGIN}"`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(LIST_OPERATION, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(SUCCESS_STATUS);
                        expect(message.subscriptions).to.be.an(`object`);
                        expect(Object.entries(message.subscriptions).map(([subscriptionId, subscriptionObject]) => {
                            return subscriptionObject.deviceIds[0];
                        })).to.include.members([DEVICE_ID]);
                        expect(Object.entries(message.subscriptions).map(([subscriptionId, subscriptionObject]) => {
                            return subscriptionObject.names[0];
                        })).to.include.members([`${TEST_NAME}1`, `${TEST_NAME}1`]);

                        resolve();
                    }
                });

                mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                    action: LIST_ACTION,
                    requestId: requestId,
                    type: SUBSCRIPTION_COMMAND_TYPE
                }));
            });
        });

        it(`should query the list of notification subscriptions for the user login: "${TEST_LOGIN}"`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(LIST_OPERATION, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(SUCCESS_STATUS);
                        expect(message.subscriptions).to.be.an(`object`);
                        expect(Object.entries(message.subscriptions).map(([subscriptionId, subscriptionObject]) => {
                            return subscriptionObject.deviceIds[0];
                        })).to.include.members([DEVICE_ID]);
                        expect(Object.entries(message.subscriptions).map(([subscriptionId, subscriptionObject]) => {
                            return subscriptionObject.names[0];
                        })).to.include.members([`${TEST_NAME}1`, `${TEST_NAME}1`]);

                        resolve();
                    }
                });

                mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                    action: LIST_ACTION,
                    requestId: requestId,
                    type: SUBSCRIPTION_NOTIFICATION_TYPE
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
    });

    describe(`Token API`, () => {
        const ee = new EventEmitter();
        const SUBJECT = `token`;
        const TOKEN_OPERATION = SUBJECT;
        const CREATE_OPERATION = `create`;
        const REFRESH_OPERATION = `refresh`;
        const TOKEN_ACTION = TOKEN_OPERATION;
        const CREATE_ACTION = `${SUBJECT}/${CREATE_OPERATION}`;
        const REFRESH_ACTION = `${SUBJECT}/${REFRESH_OPERATION}`;
        const TOKEN_TOPIC = `${DH_RESPONSE_TOPIC}/${TOKEN_ACTION}`;
        const CREATE_TOPIC = `${DH_RESPONSE_TOPIC}/${CREATE_ACTION}`;
        const REFRESH_TOPIC = `${DH_RESPONSE_TOPIC}/${REFRESH_ACTION}`;
        const TEST_PAYLOAD = {
            userId: TEST_USER_ID,
            networkIds: [NETWORK_ID],
            deviceIds: [DEVICE_ID]
        };
        let mqttClient, accessToken, refreshToken;

        it(`should connect to MQTT broker`, () => {
            return new Promise((resolve) => {
                mqttClient = mqtt.connect(MQTT_BROKER_URL, {
                    username: TEST_LOGIN,
                    password: TEST_PASSWORD
                });

                mqttClient.on(`message`, (topic, message) => {
                    const splittedTopic = topic.split(`/`);
                    ee.emit(topic.split(`/`)[splittedTopic[3] ? 3 : 2].split(`@`)[0], JSON.parse(message.toString()))
                });

                mqttClient.on('connect', () => {
                    resolve();
                });
            });
        });

        it(`should subscribe for "${TOKEN_TOPIC}" topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`${TOKEN_TOPIC}@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should subscribe for "${CREATE_TOPIC}" topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`${CREATE_TOPIC}@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should subscribe for "${REFRESH_TOPIC}" topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`${REFRESH_TOPIC}@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should create access and refresh tokens by login: "${TEST_LOGIN}" and password" "${TEST_PASSWORD}"`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(TOKEN_OPERATION, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(SUCCESS_STATUS);
                        expect(message).to.include.all.keys(`accessToken`, `refreshToken`);

                        accessToken = message.accessToken;
                        refreshToken = message.refreshToken;

                        resolve();
                    }
                });

                mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                    action: TOKEN_ACTION,
                    requestId: requestId,
                    login: TEST_LOGIN,
                    password: TEST_PASSWORD
                }));
            });
        });

        it(`should create access and refresh tokens by payload`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(CREATE_OPERATION, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(SUCCESS_STATUS);
                        expect(message).to.include.all.keys(`accessToken`, `refreshToken`);

                        accessToken = message.accessToken;
                        refreshToken = message.refreshToken;

                        resolve();
                    }
                });

                mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                    action: CREATE_ACTION,
                    requestId: requestId,
                    payload: TEST_PAYLOAD
                }));
            });
        });

        it(`should refresh access token by refresh token.`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(REFRESH_OPERATION, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(SUCCESS_STATUS);
                        expect(message).to.include.all.keys(`accessToken`);

                        accessToken = message.accessToken;

                        resolve();
                    }
                });

                mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                    action: REFRESH_ACTION,
                    requestId: requestId,
                    refreshToken: refreshToken
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
    });

    describe(`Authentication API`, () => {
        const ee = new EventEmitter();
        const SUBJECT = `authenticate`;
        const AUTHENTICATE_OPERATION = SUBJECT;
        const AUTHENTICATE_ACTION = AUTHENTICATE_OPERATION;
        const AUTHENTICATE_TOPIC = `${DH_RESPONSE_TOPIC}/${AUTHENTICATE_ACTION}`;
        const TOKEN_OPERATION = `token`;
        const TOKEN_ACTION = TOKEN_OPERATION;
        const TOKEN_TOPIC = `${DH_RESPONSE_TOPIC}/${TOKEN_ACTION}`;
        let mqttClient;

        it(`should connect to MQTT broker`, () => {
            return new Promise((resolve) => {
                mqttClient = mqtt.connect(MQTT_BROKER_URL, {
                    username: TEST_LOGIN,
                    password: TEST_PASSWORD
                });

                mqttClient.on(`message`, (topic, message) => {
                    ee.emit(topic.split(`/`)[2].split(`@`)[0], JSON.parse(message.toString()))
                });

                mqttClient.on('connect', () => {
                    resolve();
                });
            });
        });

        it(`should subscribe for "${AUTHENTICATE_TOPIC}" topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`${AUTHENTICATE_TOPIC}@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should subscribe for "${TOKEN_TOPIC}" topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`${TOKEN_TOPIC}@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should authenticate by access token received from server`, () => {
            const requestId1 = randomString.generate();
            const requestId2 = randomString.generate();

            return new Promise((resolve) => {
                ee.once(AUTHENTICATE_OPERATION, (message) => {
                    if (message.requestId === requestId2) {
                        expect(message.status).to.equal(SUCCESS_STATUS);

                        resolve();
                    }
                });

                ee.once(TOKEN_OPERATION, (message) => {
                    if (message.requestId === requestId1) {
                        expect(message.status).to.equal(SUCCESS_STATUS);
                        expect(message).to.include.all.keys(`accessToken`, `refreshToken`);

                        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                            action: AUTHENTICATE_ACTION,
                            requestId: requestId2,
                            token: message.accessToken
                        }));
                    }
                });

                mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                    action: TOKEN_ACTION,
                    requestId: requestId1,
                    login: TEST_LOGIN,
                    password: TEST_PASSWORD
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
    });

    describe(`Server API`, () => {
        const ee = new EventEmitter();
        const SUBJECT = `server`;
        const INFO_OPERATION = `info`;
        const INFO_ACTION = `${SUBJECT}/${INFO_OPERATION}`;
        const INFO_TOPIC = `${DH_RESPONSE_TOPIC}/${INFO_ACTION}`;
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

        it(`should subscribe for "${INFO_TOPIC}" topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`${INFO_TOPIC}@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should get server information`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(INFO_OPERATION, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(SUCCESS_STATUS);
                        expect(message).to.include.all.keys(`info`);

                        resolve();
                    }
                });

                mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                    action: INFO_ACTION,
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
    });

    describe(`Cluster API`, () => {
        const ee = new EventEmitter();
        const SUBJECT = `cluster`;
        const INFO_OPERATION = `info`;
        const INFO_ACTION = `${SUBJECT}/${INFO_OPERATION}`;
        const INFO_TOPIC = `${DH_RESPONSE_TOPIC}/${INFO_ACTION}`;
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

        it(`should subscribe for "${INFO_TOPIC}" topic`, () => {
            return new Promise((resolve, reject) => {
                mqttClient.subscribe(`${INFO_TOPIC}@${mqttClient.options.clientId}`, (err) => {
                    if (err) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        });

        it(`should get cluster information`, () => {
            const requestId = randomString.generate();

            return new Promise((resolve) => {
                ee.once(INFO_OPERATION, (message) => {
                    if (message.requestId === requestId) {
                        expect(message.status).to.equal(SUCCESS_STATUS);
                        expect(message).to.include.all.keys(`clusterInfo`);

                        resolve();
                    }
                });

                mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                    action: INFO_ACTION,
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
    });

    describe(`Basic functionality`, () => {
        let mqttClient;

        beforeEach(() => {
            mqttClient = mqtt.connect(MQTT_BROKER_URL, {
                username: TEST_LOGIN,
                password: TEST_PASSWORD
            });
        });

        afterEach(() => {
            mqttClient.end();
        });

        it(`should connect to MQTT broker on "${MQTT_BROKER_URL}" as user: "${TEST_LOGIN}"`, (done) => {
            mqttClient.on(`connect`, () => {
                done();
            });

            mqttClient.on(`error`, (err) => {
                assert.fail(`error`, `no error`, err);
            });
        });

        it(`should receive access and refresh tokens`, (done) => {
            const responseTopic = `dh/response/token@${mqttClient.options.clientId}`;
            const requestId = `integrationTestRequestId`;

            mqttClient.on(`connect`, () => {
                mqttClient.subscribe(responseTopic, () => {
                    mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                        action: `token`,
                        requestId: requestId,
                        login: TEST_LOGIN,
                        password: TEST_PASSWORD
                    }));
                });
            });

            mqttClient.on(`message`, (topic, message) => {
                const messageObject = JSON.parse(message.toString());

                expect(topic).to.equal(responseTopic);
                expect(messageObject.status).to.equal(SUCCESS_STATUS);
                expect(messageObject.requestId).to.equal(requestId);
                expect(messageObject).to.include.all.keys(`accessToken`, `refreshToken`);

                done();
            });

            mqttClient.on(`error`, (err) => {
                assert.fail(`error`, `no error`, err);
            });
        });

        it(`should subscribe for notification/insert event and publish new notification`, (done) => {
            const randomNotificationName = randomString.generate();
            const subscriptionTopic = `dh/notification/${NETWORK_ID}/${DEVICE_ID}/${randomNotificationName}`;
            const action = `notification/insert`;

            mqttClient.on(`connect`, () => {
                mqttClient.subscribe(subscriptionTopic, () => {
                    mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                        action: action,
                        deviceId: DEVICE_ID,
                        networkId: NETWORK_ID,
                        notification: {
                            notification: randomNotificationName,
                            timestamp: new Date(),
                            parameters: {
                                temperature: 999
                            }
                        }
                    }));
                });
            });

            mqttClient.on(`message`, (topic, message) => {
                const messageObject = JSON.parse(message.toString());

                expect(topic).to.equal(subscriptionTopic);
                expect(messageObject.action).to.equal(action);
                expect(messageObject.notification.notification).to.equal(randomNotificationName);

                done();
            });

            mqttClient.on(`error`, (err) => {
                assert.fail(`error`, `no error`, err);
            });
        });

        it(`should subscribe for command/insert event and publish new command`, (done) => {
            const randomCommandName = randomString.generate();
            const subscriptionTopic = `dh/command/${NETWORK_ID}/${DEVICE_ID}/${randomCommandName}`;
            const action = `command/insert`;

            mqttClient.on(`connect`, () => {
                mqttClient.subscribe(subscriptionTopic, () => {
                    mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                        action: action,
                        deviceId: DEVICE_ID,
                        networkId: NETWORK_ID,
                        command: {
                            command: randomCommandName,
                            timestamp: new Date(),
                            lifetime: 15,
                            parameters: {
                                value: 1
                            }
                        }
                    }));
                });
            });

            mqttClient.on(`message`, (topic, message) => {
                const messageObject = JSON.parse(message.toString());

                if (topic === subscriptionTopic) {
                    expect(topic).to.equal(subscriptionTopic);
                    expect(messageObject.action).to.equal(action);
                    expect(messageObject.command.command).to.equal(randomCommandName);
                }

                done();
            });

            mqttClient.on(`error`, (err) => {
                assert.fail(`error`, `no error`, err);
            });
        });

        it(`should subscribe for command/update event, create and update command`, (done) => {
            const randomCommandName = randomString.generate();
            const subscriptionTopic1 = `dh/command_update/${NETWORK_ID}/${DEVICE_ID}/${randomCommandName}`;
            const subscriptionTopic2 = `dh/command/${NETWORK_ID}/${DEVICE_ID}/${randomCommandName}`;
            const actionInsert = `command/insert`;
            const actionUpdate = `command/update`;
            const startValue = 1;
            const newValue = 432;

            mqttClient.on(`connect`, () => {
                mqttClient.subscribe(subscriptionTopic1);
                mqttClient.subscribe(subscriptionTopic2, () => {
                    mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                        action: actionInsert,
                        deviceId: DEVICE_ID,
                        networkId: NETWORK_ID,
                        command: {
                            command: randomCommandName,
                            timestamp: new Date(),
                            lifetime: 15,
                            parameters: {
                                value: startValue
                            }
                        }
                    }));
                });
            });

            mqttClient.on(`message`, (topic, message) => {
                const messageObject = JSON.parse(message.toString());

                if (topic === subscriptionTopic2) {
                    expect(messageObject.command.parameters.value).to.equal(startValue);

                    mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                        action: actionUpdate,
                        deviceId: DEVICE_ID,
                        commandId: messageObject.command.id,
                        command: {
                            command: randomCommandName,
                            parameters: {
                                value: newValue
                            }
                        }
                    }));
                } else if (topic === subscriptionTopic1) {
                    expect(messageObject.action).to.equal(actionUpdate);
                    expect(messageObject.command.parameters.value).to.equal(newValue);
                    expect(messageObject.command.command).to.equal(randomCommandName);

                    done();
                }
            });

            mqttClient.on(`error`, (err) => {
                assert.fail(`error`, `no error`, err);
            });
        });

        it(`should be able to unsubscribe from previous subscriptions`, (done) => {
            const subscriptionTopic1 = `dh/notification/${NETWORK_ID}/${DEVICE_ID}/light`;
            const subscriptionTopic2 = `dh/command/${NETWORK_ID}/${DEVICE_ID}/switchOff`;
            const actionNotification = `notification/insert`;
            const actionCommand = `command/insert`;
            const subscription1Spy = sinon.spy();
            const subscription2Spy = sinon.spy();

            mqttClient.on(`connect`, () => {
                mqttClient.subscribe(subscriptionTopic1, () => {
                    mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                        action: actionNotification,
                        deviceId: DEVICE_ID,
                        networkId: NETWORK_ID,
                        notification: {
                            notification: `light`,
                            timestamp: new Date(),
                            parameters: {
                                status: `on`
                            }
                        }
                    }));
                });

                mqttClient.subscribe(subscriptionTopic2, () => {
                    mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                        action: actionCommand,
                        deviceId: DEVICE_ID,
                        networkId: NETWORK_ID,
                        command: {
                            command: 'switchOff',
                            timestamp: new Date(),
                            lifetime: 60,
                            parameters: {
                                value: 'off'
                            }
                        }
                    }));
                });
            });

            mqttClient.on(`message`, (topic, message) => {
                if (topic === subscriptionTopic1) {
                    subscription1Spy();

                    mqttClient.unsubscribe(subscriptionTopic1, () => {
                        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                            action: actionNotification,
                            deviceId: DEVICE_ID,
                            networkId: NETWORK_ID,
                            notification: {
                                notification: `light`,
                                timestamp: new Date(),
                                parameters: {
                                    status: `off`
                                }
                            }
                        }));
                    });
                } else if (topic === subscriptionTopic2) {
                    subscription2Spy();

                    mqttClient.unsubscribe(subscriptionTopic2, () => {
                        mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                            action: actionCommand,
                            deviceId: DEVICE_ID,
                            networkId: NETWORK_ID,
                            command: {
                                command: 'switchOn',
                                timestamp: new Date(),
                                lifetime: 60,
                                parameters: {
                                    value: 'on'
                                }
                            }
                        }));
                    });
                }
            });

            mqttClient.on(`error`, (err) => {
                assert.fail(`error`, `no error`, err);
            });

            /** TODO find better way than check expectations in setTimeout
             */
            setTimeout(() => {
                expect(subscription1Spy.calledOnce).to.equal(true);
                expect(subscription2Spy.calledOnce).to.equal(true);

                done();
            }, 4500);
        }).timeout(5000);

        it(`should send notification of same subscription for each subscriber only once`, (done) => {
            const SUBSCRIPTION_TOPIC = `dh/notification/${NETWORK_ID}/${DEVICE_ID}/sharedNotification`;
            const ACTION_NOTIFICATION = `notification/insert`;
            const mqttClient2 = mqtt.connect(MQTT_BROKER_URL, { username: TEST_LOGIN, password: TEST_PASSWORD });
            const mqttClient3 = mqtt.connect(MQTT_BROKER_URL, { username: TEST_LOGIN, password: TEST_PASSWORD });
            let subscriptionCounter = 0;
            const sharedPublisher = () => {
                subscriptionCounter++;

                if (subscriptionCounter > 2) {
                    mqttClient.publish(DH_REQUEST_TOPIC, JSON.stringify({
                        action: ACTION_NOTIFICATION,
                        deviceId: DEVICE_ID,
                        networkId: NETWORK_ID,
                        notification: {
                            notification: `sharedNotification`,
                            timestamp: new Date(),
                            parameters: {
                                status: `share`
                            }
                        }
                    }));
                }
            };

            const mqttClient1Spy = sinon.spy();
            const mqttClient2Spy = sinon.spy();
            const mqttClient3Spy = sinon.spy();

            mqttClient.on(`connect`, () => {
                mqttClient.subscribe(SUBSCRIPTION_TOPIC, () => sharedPublisher());
            });

            mqttClient2.on(`connect`, () => {
                mqttClient2.subscribe(SUBSCRIPTION_TOPIC, () => sharedPublisher());
            });

            mqttClient3.on(`connect`, () => {
                mqttClient3.subscribe(SUBSCRIPTION_TOPIC, () => sharedPublisher());
            });

            mqttClient.on(`message`, (topic, message) => {
                if (topic === SUBSCRIPTION_TOPIC) {
                    mqttClient1Spy();
                }
            });

            mqttClient2.on(`message`, (topic, message) => {
                if (topic === SUBSCRIPTION_TOPIC) {
                    mqttClient2Spy();
                }
            });

            mqttClient3.on(`message`, (topic, message) => {
                if (topic === SUBSCRIPTION_TOPIC) {
                    mqttClient3Spy();
                    mqttClient3.unsubscribe(SUBSCRIPTION_TOPIC, () => sharedPublisher());
                }
            });

            /** TODO find better way than check expectations in setTimeout
             */
            setTimeout(() => {
                mqttClient2.end();
                mqttClient3.end();

                expect(mqttClient1Spy.callCount).to.equal(2);
                expect(mqttClient2Spy.callCount).to.equal(2);
                expect(mqttClient3Spy.calledOnce).to.equal(true);

                done();
            }, 4500);
        }).timeout(5000);
    });
});