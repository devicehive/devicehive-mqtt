const CONST = require(`../util/constants.json`);
const debug = require(`debug`)(`websocketmanager`);
const EventEmitter = require(`events`);
const WebSocketFactory = require(`./WebSocketFactory.js`);
const randomstring = require(`randomstring`);


/**
 * WebSocket manager. Handles the multiple WS session routine.
 * Access and refresh tokens for each session. Authentication.
 */
class WebSocketManager extends EventEmitter {

    /**
     * Create Web Socket manager
     * @param wsURL
     */
    constructor(wsURL) {
        super();

        const me = this;

        me.keyTokensMap = new Map();
        me.authorizedKeySet = new Set();
        me.keyLockCounterMap = new Map();
        me.wsFactory = new WebSocketFactory(wsURL);

        me.wsFactory.on(`message`, (key, message) => me.emit(`message`, key, message));

        debug(`${me.constructor.name}: ${wsURL}`);
    }

    /**
     * Check for WS session by the key
     * @param key
     * @return {boolean}
     */
    hasKey(key) {
        const me = this;

        return me.wsFactory.hasSocket(key);
    }

    /**
     * Set Access and Refresh token for WS session by the key
     * @param key
     * @param accessToken
     * @param refreshToken
     */
    setTokens(key, accessToken, refreshToken) {
        const me = this;

        if (me.wsFactory.hasSocket(key)) {
            if (me.keyTokensMap.has(key)) {
                const oldTokens = me.keyTokensMap.get(key);

                me.keyTokensMap.set(key, {
                    accessToken: accessToken || oldTokens.accessToken,
                    refreshToken: refreshToken || oldTokens.refreshToken
                });
            } else {
                me.keyTokensMap.set(key, { accessToken, refreshToken });
            }
        }
    }

    /**
     * Get Access and Refresh tokens of WS session by the key
     * @param key
     * @return {boolean}
     */
    getTokens(key) {
        const me = this;
        let tokens = false;

        if (me.wsFactory.hasSocket(key) && me.keyTokensMap.has(key)) {
            tokens = me.keyTokensMap.get(key);
        }

        return tokens;
    }

    /**
     * Check for authorized WS session by the key
     * @param key
     * @returns {boolean}
     */
    isAuthorized(key) {
        const me = this;

        return me.wsFactory.hasSocket(key) && me.authorizedKeySet.has(key);
    }

    /**
     * Mark WS session by the key as authorized
     * @param key
     */
    setAuthorized(key) {
        const me = this;

        debug(`${me.setAuthorized.name}: ${key}`);

        if (me.wsFactory.hasSocket(key)) {
            me.authorizedKeySet.add(key);
        }
    }

    /**
     * Remove authorized mark from WS session by the key
     * @param key
     */
    removeAuthorized(key) {
        const me = this;

        debug(`${me.removeAuthorized.name}: ${key}`);

        me.authorizedKeySet.delete(key);
    }

    /**
     * Get access and refresh token for by user credentials
     * @param key {string} - key
     * @param login {String} - user login
     * @param password {String} = user password
     * @returns {Promise}
     */
    createTokens(key, login, password) {
        const me = this;

        debug(`${me.createTokens.name}: ${key}`);

        return me.send(key, {
                action: CONST.WS.ACTIONS.TOKEN,
                login: login,
                password: password
            })
            .then((tokens) => {
                me.setTokens(key, tokens);

                return tokens;
            });
    }

    /**
     * Authenticate user by accessToken
     * @param key {string} key
     * @param accessToken {string}
     * @returns {Promise}
     */
    authenticate(key, accessToken) {
        const me = this;

        debug(`${me.authenticate.name}: ${key}`);

        return me.send(key, {
                action: CONST.WS.ACTIONS.AUTHENTICATE,
                token: accessToken
            })
            .then(() => {
                me.setAuthorized(key);
            });
    }

    /**
     * Send message object over WS session by the key
     * @param key
     * @param messageObject
     * @return {Promise}
     */
    send(key, messageObject) {
        const me = this;

        debug(`${me.send.name}: ${key}`);

        me._lock(key);

        return me.wsFactory.getSocket(key)
            .then((wSocket) => {
                return new Promise((resolve, reject) => {
                    const hasRequestId = messageObject.requestId;

                    if (!hasRequestId) {
                        messageObject.requestId = randomstring.generate();
                    }

                    wSocket.sendString(JSON.stringify(messageObject));

                    const listener = (event) => {
                        const messageData = JSON.parse(event.data);

                        if (messageData.action === messageObject.action) {
                            if (messageData.requestId === messageObject.requestId) {
                                if (!hasRequestId) {
                                    delete messageData.requestId;
                                }

                                wSocket.removeListener(`message`, listener);

                                if (messageData.status === CONST.WS.SUCCESS_STATUS) {
                                    resolve(messageData);
                                } else {
                                    reject(messageData.error);
                                }
                            }
                        }
                    };

                    wSocket.addEventListener(`message`, listener);
                });
            })
            .then((response) => {
                me._unlock(key);
                return response;
            })
            .catch((err) => {
                me._unlock(key);
                throw err;
            });
    }

    /**
     * Send string message (forward string message) over WS session by the key
     * @param key
     * @param stringMessage
     */
    sendString(key, stringMessage) {
        const me = this;

        debug(`${me.sendString.name}: ${key}`);

        me._lock(key);

        me.wsFactory.getSocket(key)
            .then((wSocket) => {
                if (me.wsFactory.hasSocket(key)) {
                    wSocket.sendString(stringMessage, () => me._unlock(key));
                }
            });
    }

    /**
     * Close WS session by the key
     * @param key
     */
    close(key) {
        const me = this;

        debug(`${me.close.name}: ${key}`);

        if (me._isLocked(key)) {
            me.once(`_unlock_${key}`, () => process.nextTick(() => me.close(key)));
        } else {
            me.removeAuthorized(key);
            me.keyLockCounterMap.delete(key);
            me.wsFactory.removeSocket(key);
        }
    }

    /**
     * Lock WS session resource
     * @param key
     */
    lock(key) {
        const me = this;

        me._lock(key);
    }

    /**
     * Unlock WS session resource
     * @param key
     */
    unlock(key) {
        const me = this;

        me._unlock(key);
    }

    /**
     * Lock WS session resource
     * @param key
     * @private
     */
    _lock(key) {
        const me = this;

        debug(`${me._lock.name}: ${key}`);

        if (me.keyLockCounterMap.has(key)) {
            let counter = me.keyLockCounterMap.get(key);

            me.keyLockCounterMap.set(key, ++counter);

            if (counter === 1) {
                me.emit(`_lock_${key}`);
            }
        } else {
            me.keyLockCounterMap.set(key, 1);
        }
    }

    /**
     * Unlock WS session resource
     * @param key
     * @private
     */
    _unlock(key) {
        const me = this;

        debug(`${me._unlock.name}: ${key}`);

        if (me.keyLockCounterMap.has(key)) {
            let counter = me.keyLockCounterMap.get(key);

            if (counter !== 0) {
                me.keyLockCounterMap.set(key, --counter);

                if (counter === 0) {
                    me.emit(`_unlock_${key}`);
                }
            }
        }
    }

    /**
     * Check for locked WS session resource
     * @param key
     * @return {boolean}
     * @private
     */
    _isLocked(key) {
        const me = this;
        let result = false;

        if (me.keyLockCounterMap.has(key)) {
            result = me.keyLockCounterMap.get(key) !== 0;
        }

        return result
    }
}

module.exports = WebSocketManager;