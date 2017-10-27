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