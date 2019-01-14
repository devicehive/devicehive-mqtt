const debug = require(`debug`)(`proxy:client`);
const Utils = require(`./utils/Utils`);
const WS = require(`ws`);
const EventEmitter = require(`events`);
const { Message, MessageUtils } = require(`devicehive-proxy-message`);
const FIFO = require('fifo');


/**
 * DeviceHive WebSocket Proxy client
 */
class ProxyClient extends EventEmitter {

    static get ERROR_CONNECTION_RESET_CODE() { return `ECONNRESET`; }
    static get ERROR_CONNECTION_REFUSED_CODE() { return `ECONNREFUSED`; }
    static get NORMAL_CLOSE_CODE() { return 1000; }

    /**
     * Creates new ProxyClient object
     * @param config {Object} configuration object
     * @param config.webSocketServerUrl {String} DeviceHive WS Proxy URL
     * @param config.autoReconnectIntervalMs {Number} auto reconnection interval in ms
     * @param config.persistMessageWhileReconnecting {Boolean} persist message while WS Proxy is nor reachable
     */
    constructor({ webSocketServerUrl, autoReconnectIntervalMs, persistMessageWhileReconnecting } = {}) {
        super();

        this.url = webSocketServerUrl;
        this.autoReconnectIntervalMs= autoReconnectIntervalMs;
        this.persistMessageWhileReconnecting= persistMessageWhileReconnecting;
        this.pendingMessageBuffer = new FIFO();
        this.isReconnecting = false;

        this._open();
    }

    /**
     * Sends message to WS Proxy
     * @param message {Message} message to send
     */
    sendMessage(message = new Message()) {
        const me = this;

        try {
            if (Utils.isTrue(me.isReconnecting) &&
                Utils.isTrue(me.persistMessageWhileReconnecting)) {
                me._persistPendingMessage(message);
            } else {
                me.ws.send(message.toString());
            }
        } catch (error) {
            debug(`Error while sending message: ${error}`);

            me._persistPendingMessage(message);
        }
    }

    /**
     * Opens WS connection
     * @private
     */
    _open() {
        const me = this;

        me.ws = new WS(me.url);

        me.ws.addEventListener(`open`, () => {
            me.isReconnecting = false;

            process.nextTick(() => me.emit(`open`));
            debug(`Connected to ${me.url}`);

            me._sendAllPendingMessages();
        });

        me.ws.addEventListener(`close`, (code, reason) => {
            me.isReconnecting = false;

            switch (code){
                case ProxyClient.NORMAL_CLOSE_CODE:
                    process.nextTick(() => me.emit(`close`));
                    debug(`Connection has been closed. Reason: ${reason}`);
                    break;
                default:
                    me._reconnect();
                    break;
            }
        });

        me.ws.addEventListener(`error`, (error) => {
            me.isReconnecting = false;

            switch (error.code){
                case ProxyClient.ERROR_CONNECTION_RESET_CODE:
                case ProxyClient.ERROR_CONNECTION_REFUSED_CODE:
                    me._reconnect();
                    break;
                default:
                    me.emit(`error`, error);
                    debug(`Proxy client error: ${error}`);
                    break;
            }
        });

        me.ws.addEventListener(`ping`, (pingData) => {
            me.emit(`ping`, pingData);
            debug(`Ping from WebSocket server`);
        });

        me.ws.addEventListener(`message`, (event) => {
            try {
                let messages = JSON.parse(event.data);
                messages = messages.length ? messages : [ messages ];

                for (let messageCount = 0; messageCount < messages.length; messageCount++) {
                    const message = Message.normalize(messages[messageCount]);

                    if (message.status === MessageUtils.FAILED_STATUS) {
                        me.emit(`error`, message);
                    } else {
                        me.emit(`message`, message);
                    }
                }
            } catch (error) {
                debug(`Error on incoming message: ${error}`);
            }
        });
    }

    /**
     * Reconnection routine
     * @private
     */
    _reconnect() {
        const me = this;

        me.isReconnecting = true;

        debug(`Reconnection in ${me.autoReconnectIntervalMs} ms`);
        me.ws.removeAllListeners();

        setTimeout(() => {
            debug(`Reconnecting...`);
            me._open();
        }, me.autoReconnectIntervalMs);
    }

    /**
     * Adds message to pending buffer
     * @param message {Message} pending message
     * @private
     */
    _persistPendingMessage(message) {
        const me = this;

        if (Utils.isTrue(me.isReconnecting) &&
            Utils.isTrue(me.persistMessageWhileReconnecting)) {
            me.pendingMessageBuffer.push(message);

            debug(`New message in pending status. Total pending messages: ${me.pendingMessageBuffer.length}`);
        }
    }

    /**
     * Sends all pending messages
     * @private
     */
    _sendAllPendingMessages() {
        const me = this;

        if (!Utils.isTrue(me.isReconnecting) &&
            Utils.isTrue(me.persistMessageWhileReconnecting) &&
            me.pendingMessageBuffer.length > 0) {

            debug(`Starting to send pending messages. Total pending messages: ${me.pendingMessageBuffer.length}`);

            while(me.pendingMessageBuffer.length) {
                me.sendMessage(me.pendingMessageBuffer.shift());
            }

            debug(`All ${me.pendingMessageBuffer.length} pending messages were sent`);
        }
    }
}


module.exports = ProxyClient;
