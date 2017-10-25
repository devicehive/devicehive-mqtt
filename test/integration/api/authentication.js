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