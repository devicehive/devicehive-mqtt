const WebSocketFactory = require(`../../../lib/WebSocketFactory.js`);
const WebSocketServer = require(`ws`).Server;
const sinon = require(`sinon`);
const chai = require(`chai`);
const expect = chai.expect;

describe(WebSocketFactory.name, () => {
    const listOfMethods = [`getSocket`, `removeSocket`, `hasSocket`];
    const testMessage = 'testMessage';
    const WS_SERVER_PORT = 9090;
    const WS_SERVER_URL = `ws://127.0.0.1:${WS_SERVER_PORT}`;
    const client1 = `client1`;
    const client2 = `client2`;
    const client3 = `client3`;


    it(`should be a class`, () => {
        expect(WebSocketFactory).to.be.a(`Function`);
    });

    it(`should has next methods: ${listOfMethods.join(`, `)}`, () => {
        listOfMethods.forEach((methodName) => {
            expect(new WebSocketFactory()[methodName]).to.be.a(`Function`);
        });
    });

    describe(`Events`, () => {
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

        it(`should fire event: "message"`, (done) => {
            const wsFactory = new WebSocketFactory(WS_SERVER_URL);
            const checkExpectation = () => {
                if (wsClient1Spy.calledOnce && wsClient2Spy.calledOnce && wsClient3Spy.calledOnce) {
                    done();
                }
            };
            const wsClient1Spy = sinon.spy(checkExpectation);
            const wsClient2Spy = sinon.spy(checkExpectation);
            const wsClient3Spy = sinon.spy(checkExpectation);

            wsFactory.on(`message`, (client, message) => {
                expect(message.data).to.equal(testMessage);
                switch (client) {
                    case client1:
                        wsClient1Spy();
                        break;
                    case client2:
                        wsClient2Spy();
                        break;
                    case client3:
                        wsClient3Spy();
                        break;
                }
            });

            wsFactory.getSocket(client1);
            wsFactory.getSocket(client2);
            wsFactory.getSocket(client3);
        });
    });
});

