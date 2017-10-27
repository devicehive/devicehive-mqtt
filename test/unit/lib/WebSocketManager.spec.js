const EventEmitter = require(`events`);
const WebSocketManager = require(`../../../lib/WebSocketManager.js`);
const WebSocketServer = require(`ws`).Server;
const sinon = require(`sinon`);
const chai = require(`chai`);
const expect = chai.expect;


describe(WebSocketManager.name, () => {
    const listOfMethods = [`hasKey`, `setTokens`, `getTokens`, `isAuthorized`, `setAuthorized`,
        `removeAuthorized`, `createTokens`, `authenticate`, `send`, `sendString`, `close`];
    const testMessage = `testMessage`;
    const client1Id = `client1Id`;
    const client1AccessToken = `client1AccessToken`;
    const client1RefreshToken = `client1RefreshToken`;
    const WS_SERVER_PORT = 9090;
    const WS_SERVER_URL = `ws://127.0.0.1:${WS_SERVER_PORT}`;


    it(`should be a class`, () => {
        expect(WebSocketManager).to.be.a(`Function`);
    });

    it(`should has next methods: ${listOfMethods.join(`, `)}`, () => {
        listOfMethods.forEach((methodName) => {
            expect(new WebSocketManager(WS_SERVER_URL)[methodName]).to.be.a(`Function`);
        });
    });

    describe(`Events`, () => {
        const wsManager = new WebSocketManager(WS_SERVER_URL);
        let wsServer;

        beforeEach(() => {
            wsServer = new WebSocketServer({ port: WS_SERVER_PORT });

            wsServer.on(`connection`, (ws) => {
                ws.send(testMessage);
            });
        });

        afterEach(() => {
            wsServer.close();
        });

        it('should send string over "sendString" method and fire the "message" event', () => {
            return new Promise((resolve, reject) => {
                wsManager.sendString(client1Id, testMessage);

                wsManager.on(`message`, (clientId, message) => {
                    if (wsManager.hasKey(clientId)) {
                        expect(clientId).to.equal(client1Id);
                        expect(message.data).to.equal(testMessage);

                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        });
    });

    describe(`Authorization map methods`, () => {
        it(`should handle clients authorization key map`, (done) => {
            const wsServer = new WebSocketServer({ port: WS_SERVER_PORT });
            const wsManager = new WebSocketManager(WS_SERVER_URL);

            wsManager.sendString(client1Id, testMessage);

            wsServer.on(`connection`, () => {
                expect(wsManager.isAuthorized(client1Id)).to.equal(false);
                wsManager.setAuthorized(client1Id);
                expect(wsManager.isAuthorized(client1Id)).to.equal(true);
                wsManager.removeAuthorized(client1Id);
                expect(wsManager.isAuthorized(client1Id)).to.equal(false);

                wsServer.close(() => done());
            });
        });
    });

    describe(`Tokens methods`, () => {
        it(`should handle clients tokens`, (done) => {
            const wsServer = new WebSocketServer({ port: WS_SERVER_PORT });
            const wsManager = new WebSocketManager(WS_SERVER_URL);

            wsManager.sendString(client1Id, testMessage);

            wsServer.on(`connection`, () => {
                wsManager.setTokens(client1Id, client1AccessToken, client1RefreshToken);

                const tokens = wsManager.getTokens(client1Id);

                expect(tokens.accessToken).to.equal(client1AccessToken);
                expect(tokens.refreshToken).to.equal(client1RefreshToken);

                wsServer.close(() => done());
            });
        });
    });

    describe(`Interaction with web socket server`, () => {
        const ee = new EventEmitter();
        const wsManager = new WebSocketManager(WS_SERVER_URL);
        let wsServer;

        before(() => {
            wsServer = new WebSocketServer({ port: WS_SERVER_PORT });

            wsServer.on(`connection`, (ws) => {
                ee.emit('connection');
                ws.on(`message`, (message) => ee.emit(`message`, message));
                ws.on(`close`, () => ee.emit(`close`));
            });
        });

        after(() => {
            wsServer.close();
        });

        it(`should connect to web socket server`, () => {
            return new Promise((resolve) => {
                wsManager.sendString(client1Id, testMessage);

                ee.once(`connection`, () => resolve());
            });
        });

        it(`should send test string to web socket server`, () => {
            return new Promise((resolve) => {
                wsManager.sendString(client1Id, testMessage);

                ee.once(`message`, (message) => {
                    expect(message).to.equal(testMessage);
                    resolve();
                })
            });
        });

        it(`should close the connection`, () => {
            return new Promise((resolve) => {
                wsManager.close(client1Id);

                ee.once(`close`, () => resolve());
            });
        });
    });
});