const EventEmitter = require(`events`);
const WS = require(`ws`);
const randomstring = require(`randomstring`);

const MAX_LISTENERS = 20;


/**
 *
 */
class WebSocket extends EventEmitter {

    /**
     *
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
     *
     */
    close() {
        const me = this;

        me.ws.close();
    }

    /**
     *
     * @param eventName
     * @param listener
     */
    addEventListener(eventName, listener) {
        const me = this;

        me.ws.addEventListener(eventName, listener);
    }

    /**
     *
     * @param eventName
     * @param listener
     */
    removeEventListener(eventName, listener) {
        const me = this;

        me.ws.removeListener(eventName, listener);
    }

    /**
     *
     * @param messageObject
     * @return {Promise}
     */
    send(messageObject) {
        const me = this;

        return new Promise((resolve, reject) => {
            const hasRequestId = messageObject.requestId;

            if (!hasRequestId) {
                messageObject.requestId = randomstring.generate();
            }

            me.ws.send(JSON.stringify(messageObject));

            const listener = (event) => {
                const messageData = JSON.parse(event.data);

                if (messageData.action === messageObject.action) {
                    if (messageData.requestId === messageObject.requestId) {
                        if (!hasRequestId) {
                            delete messageData.requestId;
                        }

                        me.ws.removeListener(`message`, listener);

                        if (messageData.status === `success`) {
                            resolve(messageData);
                        } else {
                            reject(messageData);
                        }
                    }
                }
            };

            me.ws.addEventListener(`message`, listener);
        });
    }

    /**
     *
     * @param str
     * @param callback
     */
    sendString(str, callback) {
        const me = this;

        me.ws.send(str, callback);
    }
}

module.exports = WebSocket;