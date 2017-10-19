const CONST = require(`../util/constants.json`);
const EventEmitter = require(`events`);
const WS = require(`ws`);
const randomstring = require(`randomstring`);

const MAX_LISTENERS = 20;

/**
 * WebSocket class wrapper
 * @event locked
 * @event unlocked
 */
class WebSocket extends EventEmitter {

    /**
     * Create WebSocket
     * @param serverURL
     */
    constructor (serverURL) {
        super();

        const me = this;

        me.accessToken = ``;
        me.refreshToken = ``;
        me.lockCounter = 0;

        me.ws = new WS(serverURL);
        me.ws.setMaxListeners(MAX_LISTENERS);

        me.ws.addEventListener(`open`, () => {
            me.emit(`open`);
        });

        me.ws.addEventListener(`close`, () => {
            me.emit(`close`);
        });

        me.ws.addEventListener(`message`, (message) => {
            me.emit(`message`, message)
        });
    }

    /**
     * Set access token
     * @param accessToken {string}
     */
    setAccessToken (accessToken) {
        const me = this;

        me.accessToken = accessToken;
    }

    /**
     * Get access token
     * @return {string}
     */
    getAccessToken () {
        const me = this;

        return me.accessToken;
    }

    /**
     * Set refresh token
     * @param refreshToken {string}
     */
    setRefreshToken (refreshToken) {
        const me = this;

        me.refreshToken = refreshToken;
    }

    /**
     * Get refresh token
     * @return {string}
     */
    getRefreshToken () {
        const me = this;

        return me.refreshToken;
    }

    /**
     * Close WebSocket session
     * @returns {Promise}
     */
    close () {
        const me = this;
        const doClose = (callback) => {
            me.on(`close`, () => {
                callback();
            });

            me.ws.close();
        };

        return new Promise((resolve, reject) => {
            process.nextTick(() => {
                if (me.isLocked()) {
                    me.once(`unlocked`, () => {
                        me.close()
                            .then(() => resolve())
                            .catch(() => reject());
                    });
                } else {
                    doClose(() => {
                        resolve();
                    });
                }
            });
        });
    }

    /**
     * Add event listener for WebSocket
     * @param eventName {String}
     * @param listener {Function}
     */
    addEventListener (eventName, listener) {
        const me = this;

        me.ws.addEventListener(eventName, listener);
    }


    /**
     * Remove event listener for WebSocket
     * @param eventName {String}
     * @param listener {Function}
     */
    removeEventListener (eventName, listener) {
        const me = this;

        me.ws.removeListener(eventName, listener);
    }

    /**
     * Send data
     * @param params {Object}
     * @returns {Promise}
     */
    send (params){
        const me = this;

        return new Promise((resolve, reject) => {
            if (!params.requestId){
                params.requestId = randomstring.generate();
            }

            me.lock();
            me.ws.send(JSON.stringify(params));

            const listener = (event) => {
                const messageData = JSON.parse(event.data);
                if (messageData.action === params.action){
                    if (messageData.requestId === params.requestId){
                        me.ws.removeListener(`message`, listener);
                        if (messageData.status === `success`) {
                            resolve(messageData);
                        } else {
                            reject(messageData);
                        }

                        me.unlock();
                    }
                }
            };

            me.ws.addEventListener(`message`, listener);
        })
    }

    /**
     * Send data as string
     * @param str {Object}
     */
    sendString (str){
        const me = this;

        me.lock();
        me.ws.send(str);
    }

    /**
     * Lock socket resource
     */
    lock () {
        const me = this;

        me.lockCounter += 1;

        if (me.lockCounter === 1) {
            me.emit(`locked`);
        }
    }

    /**
     * Unlock socket resource
     */
    unlock () {
        const me = this;

        if (me.lockCounter !== 0) {
            me.lockCounter -= 1;

            if (me.lockCounter === 0) {
                me.emit(`unlocked`);
            }
        }
    }

    /**
     * Check for locker socket resource
     * @returns {boolean}
     */
    isLocked () {
        const me = this;

        return me.lockCounter !== 0;
    }
}

module.exports = WebSocket;