const EventEmitter = require(`events`);
const WS = require(`ws`);

const MAX_LISTENERS = 20;


/**
 * WebSocket class wrapper
 * @event open
 * @event close
 * @event message
 */
class WebSocket extends EventEmitter {

    /**
     * Create WebSocket
     * @param serverURL
     */
    constructor(serverURL) {
        super();

        const me = this;

        me.ws = new WS(serverURL);
        me.ws.setMaxListeners(MAX_LISTENERS);

        me.ws.addEventListener(`open`, () => {
            me.emit(`open`);
        });

        me.ws.addEventListener(`close`, () => {
            me.emit(`close`);
        });

        me.ws.addEventListener(`message`, (message) => {
            me.emit(`message`, message);
        });
    }

    /**
     * Close WebSocket session
     */
    close() {
        const me = this;

        me.ws.close();
    }

    /**
     * Add event listener for WebSocket
     * @param eventName
     * @param listener
     */
    addEventListener(eventName, listener) {
        const me = this;

        me.ws.addEventListener(eventName, listener);
    }

    /**
     * Remove event listener for WebSocket
     * @param eventName
     * @param listener
     */
    removeEventListener(eventName, listener) {
        const me = this;

        me.ws.removeListener(eventName, listener);
    }

    /**
     * Send data as string
     * @param str
     * @param callback
     */
    sendString(str, callback) {
        const me = this;

        me.ws.send(str, callback);
    }
}

module.exports = WebSocket;