const WebSocket = require(`../../../lib/WebSocket.js`);
const WebSocketServer = require(`ws`).Server;
const sinon = require(`sinon`);
const chai = require(`chai`);
const expect = chai.expect;


describe(WebSocket.name, () => {
    const listOfMethods = [`close`, `addEventListener`, `removeEventListener`, `send`, `sendString`];
    const testMessage = 'testMessage';
    const testObject = { testMessage: testMessage, status: "success" };
    const WS_SERVER_PORT = 9090;
    const WS_SERVER_URL = `ws://127.0.0.1:${WS_SERVER_PORT}`;


    it(`should be a class`, () => {
        expect(WebSocket).to.be.a(`Function`);
    });

    it(`should has next methods: ${listOfMethods.join(`, `)}`, () => {
        listOfMethods.forEach((methodName) => {
            expect(new WebSocket(WS_SERVER_URL)[methodName]).to.be.a(`Function`);
        });
    });

    describe(`Events`, () => {
        let wsServer, wsClient;

        beforeEach(() => {
            wsServer = new WebSocketServer({ port: WS_SERVER_PORT });
            wsClient = new WebSocket(WS_SERVER_URL);
        });

        afterEach(() => {
            wsServer.close();
        });

        it('should fire events', (done) => {
            const checkExpectation = () => {
                if (openSpy.calledOnce && messageSpy.calledOnce && closeSpy.calledOnce) {
                    done();
                }
            };

            const openSpy = sinon.spy(checkExpectation);
            const messageSpy = sinon.spy(checkExpectation);
            const closeSpy = sinon.spy(checkExpectation);

            wsServer.on('connection', (ws) => {
                ws.on(`message`, (message) => {
                    ws.send(message);
                })
            });

            wsClient.on('open', () => {
                openSpy();
                wsClient.sendString(testMessage);
            });

            wsClient.on('message', () => {
                messageSpy();
                wsClient.close();
            });

            wsClient.on('close', () => closeSpy());
        });
    });

    describe(`Interaction with web socket server`, () => {
        let wsServer, wsClient;

        beforeEach(() => {
            wsServer = new WebSocketServer({ port: WS_SERVER_PORT });
            wsClient = new WebSocket(WS_SERVER_URL);
        });

        afterEach(() => {
            wsClient.close();
            wsServer.close();
        });

        it(`should connect to web socket server`, (done) => {
            wsClient.on(`open`, () => {
                done();
            });
        });

        it(`should send test string to web socket server`, (done) => {
            wsClient.on(`open`, () => wsClient.sendString(testMessage));

            wsServer.on('connection', (ws) => {
                ws.on(`message`, (message) => {
                    expect(message).to.equal(testMessage);
                    done();
                })
            });
        });

        it(`should send test object to web socket server`, (done) => {
            wsClient.on(`open`, () => wsClient.send(testObject));

            wsServer.on('connection', (ws) => {
                ws.on(`message`, (message) => {
                    expect(JSON.parse(message)).to.deep.equal(testObject);
                    done();
                })
            });
        });

        it(`should close the connection`, (done) => {
            wsClient.on(`open`, () => wsClient.close());

            wsServer.on('connection', (ws) => {
                ws.on(`close`, () => {
                    done();
                })
            });
        });
    });
});