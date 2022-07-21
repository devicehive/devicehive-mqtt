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

        this.ws = new WS(serverURL);
        this.ws.setMaxListeners(MAX_LISTENERS);

        this.ws.addEventListener(`open`, () => {
            this.emit(`open`);
        });

        this.ws.addEventListener(`close`, () => {
            this.emit(`close`);
        });

        this.ws.addEventListener(`message`, (message) => {
            this.emit(`message`, message);
        });
    }

    /**
     * Close WebSocket session
     */
    close() {
        this.ws.close();
    }

    /**
     * Add event listener for WebSocket
     * @param eventName
     * @param listener
     */
    addEventListener(eventName, listener) {
        this.ws.addEventListener(eventName, listener);
    }

    /**
     * Remove event listener for WebSocket
     * @param eventName
     * @param listener
     */
    removeEventListener(eventName, listener) {
        this.ws.removeListener(eventName, listener);
    }

    /**
     * Send data as string
     * @param str
     * @param callback
     */
    sendString(str, callback) {
        this.ws.send(str, callback);
    }
}

module.exports = WebSocket;
