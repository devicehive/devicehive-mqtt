const CONST = require(`../constants.json`);
const Config = require(`../../config`).test.integration;
const mqtt = require(`mqtt`);
const EventEmitter = require('events');
const randomString = require(`randomstring`);
const chai = require(`chai`);
const expect = chai.expect;

const ee = new EventEmitter();

const SUBJECT = `authenticate`;
const AUTHENTICATE_OPERATION = SUBJECT;
const TOKEN_OPERATION = `token`;
const AUTHENTICATE_ACTION = AUTHENTICATE_OPERATION;
const AUTHENTICATE_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${AUTHENTICATE_ACTION}`;
const TOKEN_ACTION = TOKEN_OPERATION;
const TOKEN_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${TOKEN_ACTION}`;
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
        ee.once(requestId1, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);

            resolve();
        });

        ee.once(requestId2, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message).to.include.all.keys(`accessToken`, `refreshToken`);

            mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
                action: AUTHENTICATE_ACTION,
                requestId: requestId2,
                token: message.accessToken
            }));
        });

        mqttClient.publish(CONST.DH_REQUEST_TOPIC, JSON.stringify({
            action: TOKEN_ACTION,
            requestId: requestId1,
            login: Config.TEST_LOGIN,
            password: Config.TEST_PASSWORD
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