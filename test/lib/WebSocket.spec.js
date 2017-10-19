const WebSocket = require(`../../lib/WebSocket.js`);
const WebSocketServer = require(`ws`).Server;
const sinon = require(`sinon`);
const chai = require(`chai`);
const expect = chai.expect;


describe(WebSocket.name, () => {
    const testMessage = 'testMessage';
    const testObject = { testMessage: testMessage };
    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';
    const WS_SERVER_PORT = 9090;
    const WS_SERVER_URL = `ws://127.0.0.1:${WS_SERVER_PORT}`;
    const listOfMethods = [`close`, `addEventListener`, `removeEventListener`,
        `send`, `sendString`, `lock`, `unlock`, `isLocked`, `setAccessToken`,
        `getAccessToken`, `setRefreshToken`, `getRefreshToken`];


    it(`should be a class`, () => {
        expect(WebSocket).to.be.a(`Function`);
    });

    it(`should has next methods: ${listOfMethods.join(`, `)}`, () => {
        listOfMethods.forEach((methodName) => {
            expect(new WebSocket(WS_SERVER_URL)[methodName]).to.be.a(`Function`);
        });
    });

    describe(`Tokens`, () => {
        it(`should set access token`, () => {
            const wsClient = new WebSocket(WS_SERVER_URL);

            wsClient.setAccessToken(accessToken);

            expect(wsClient.getAccessToken()).to.equal(accessToken);
        });

        it(`should set refresh token`, () => {
            const wsClient = new WebSocket(WS_SERVER_URL);

            wsClient.setRefreshToken(refreshToken);

            expect(wsClient.getRefreshToken()).to.equal(refreshToken);
        });
    });

    describe(`Interaction with web socket server`, () => {

        it(`should connect to web socket server`, (done) => {
            const wsServer = new WebSocketServer({ port: WS_SERVER_PORT });
            const wsClient = new WebSocket(WS_SERVER_URL);

            wsClient.on(`open`, () => {
                wsServer.close(() => done());
                wsClient.close();
            });
        });

        it(`should send test string to web socket server`, (done) => {
            const wsServer = new WebSocketServer({ port: WS_SERVER_PORT });
            const wsClient = new WebSocket(WS_SERVER_URL);

            wsClient.on(`open`, () => wsClient.sendString(testMessage));

            wsServer.on('connection', (ws) => {
                ws.on(`message`, (message) => {
                    expect(message).to.equal(testMessage);

                    wsServer.close(() => done());
                    wsClient.close();
                })
            });
        });
    });
});