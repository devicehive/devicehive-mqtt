const CONST = require(`../constants.json`);
const Config = require(`../../config`).test.integration;
const mqtt = require(`mqtt`);
const EventEmitter = require("events");
const randomString = require(`randomstring`);
const chai = require(`chai`);
const expect = chai.expect;

const ee = new EventEmitter();

const SUBJECT = `token`;
const TOKEN_OPERATION = SUBJECT;
const CREATE_OPERATION = `create`;
const REFRESH_OPERATION = `refresh`;
const TOKEN_ACTION = TOKEN_OPERATION;
const CREATE_ACTION = `${SUBJECT}/${CREATE_OPERATION}`;
const REFRESH_ACTION = `${SUBJECT}/${REFRESH_OPERATION}`;
const TOKEN_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${TOKEN_ACTION}`;
const CREATE_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${CREATE_ACTION}`;
const REFRESH_TOPIC = `${CONST.DH_RESPONSE_TOPIC}/${REFRESH_ACTION}`;
const TEST_PAYLOAD = {
    userId: Config.TEST_USER_ID,
    networkIds: [Config.NETWORK_ID],
    deviceTypeIds: [Config.DEVICE_TYPE_ID],
};
let mqttClient;
let refreshToken;

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

it(`should subscribe for "${TOKEN_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(
            `${TOKEN_TOPIC}@${mqttClient.options.clientId}`,
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

it(`should subscribe for "${CREATE_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(
            `${CREATE_TOPIC}@${mqttClient.options.clientId}`,
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

it(`should subscribe for "${REFRESH_TOPIC}" topic`, () => {
    return new Promise((resolve, reject) => {
        mqttClient.subscribe(
            `${REFRESH_TOPIC}@${mqttClient.options.clientId}`,
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

it(`should create access and refresh tokens by login: "${Config.TEST_LOGIN}" and password" "${Config.TEST_PASSWORD}"`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message).to.include.all.keys(`accessToken`, `refreshToken`);

            refreshToken = message.refreshToken;

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: TOKEN_ACTION,
                requestId: requestId,
                login: Config.TEST_LOGIN,
                password: Config.TEST_PASSWORD,
            })
        );
    });
});

it(`should create access and refresh tokens by payload`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message).to.include.all.keys(`accessToken`, `refreshToken`);

            refreshToken = message.refreshToken;

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: CREATE_ACTION,
                requestId: requestId,
                payload: TEST_PAYLOAD,
            })
        );
    });
});

it(`should refresh access token by refresh token.`, () => {
    const requestId = randomString.generate();

    return new Promise((resolve) => {
        ee.once(requestId, (message) => {
            expect(message.status).to.equal(CONST.SUCCESS_STATUS);
            expect(message).to.include.all.keys(`accessToken`);

            resolve();
        });

        mqttClient.publish(
            CONST.DH_REQUEST_TOPIC,
            JSON.stringify({
                action: REFRESH_ACTION,
                requestId: requestId,
                refreshToken: refreshToken,
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
