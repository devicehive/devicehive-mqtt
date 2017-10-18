const EventEmitter = require(`events`);
const WS = require(`ws`);
const randomstring = require(`randomstring`);
const CONST = require(`../util/constants.json`);


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

        this.ws = new WS(serverURL);
        this.accessToken = ``;
        this.refreshToken = ``;
        this.lockCounter = 0;
    }

    /**
     * Close WebSocket session
     * @returns {Promise}
     */
    close () {
        const me = this;
        const doClose = (callback) => {
            me.ws.addEventListener(`close`, () => {
                callback();
            });

            me.ws.close();
        };

        return new Promise((resolve, reject) => {
            process.nextTick(() => {
                if (me.isLocked()) {
                    me.once(`unlocked`, () => {
                        me.close().then(() => {
                            resolve();
                        });
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
     * Get access and refresh token for by user credentials
     * @param login {String} - user login
     * @param password {String} = user password
     * @returns {Promise}
     */
    createTokenByLoginInfo (login, password) {
        const me = this;

        return me.send({
            action: CONST.WS.ACTIONS.TOKEN,
            login: login,
            password: password
        }).then(({ accessToken, refreshToken }) => {
            me.accessToken = accessToken;
            me.refreshToken = refreshToken;

            return { accessToken, refreshToken };
        });
    }

    /**
     * Authenticate user by accessToken
     * @param accessToken
     * @returns {Promise}
     */
    authenticate (accessToken) {
        const me = this;

        return me.send({
            action: CONST.WS.ACTIONS.AUTHENTICATE,
            token: accessToken
        })
    }

    /**
     * Lock socket resource
     */
    lock () {
        const me = this;

        me.lockCounter += 1;
        me.emit(`locked`);
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