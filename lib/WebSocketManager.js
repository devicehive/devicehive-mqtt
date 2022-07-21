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

        this.keyTokensMap = new Map();
        this.authorizedKeySet = new Set();
        this.keyLockCounterMap = new Map();
        this.wsFactory = new WebSocketFactory(wsURL);

        this.wsFactory.on(`message`, (key, message) => this.emit(`message`, key, message));

        debug(`${this.constructor.name}: ${wsURL}`);
    }

    /**
     * Check for WS session by the key
     * @param key
     * @return {boolean}
     */
    hasKey(key) {
        return this.wsFactory.hasSocket(key);
    }

    /**
     * Set Access and Refresh token for WS session by the key
     * @param key
     * @param accessToken
     * @param refreshToken
     */
    setTokens(key, accessToken, refreshToken) {
        if (this.wsFactory.hasSocket(key)) {
            if (this.keyTokensMap.has(key)) {
                const oldTokens = this.keyTokensMap.get(key);

                this.keyTokensMap.set(key, {
                    accessToken: accessToken || oldTokens.accessToken,
                    refreshToken: refreshToken || oldTokens.refreshToken
                });
            } else {
                this.keyTokensMap.set(key, { accessToken, refreshToken });
            }
        }
    }

    /**
     * Get Access and Refresh tokens of WS session by the key
     * @param key
     * @return {boolean}
     */
    getTokens(key) {
        let tokens = false;

        if (this.wsFactory.hasSocket(key) && this.keyTokensMap.has(key)) {
            tokens = this.keyTokensMap.get(key);
        }

        return tokens;
    }

    /**
     * Check for authorized WS session by the key
     * @param key
     * @returns {boolean}
     */
    isAuthorized(key) {
        return this.wsFactory.hasSocket(key) && this.authorizedKeySet.has(key);
    }

    /**
     * Mark WS session by the key as authorized
     * @param key
     */
    setAuthorized(key) {
        debug(`${this.setAuthorized.name}: ${key}`);

        if (this.wsFactory.hasSocket(key)) {
            this.authorizedKeySet.add(key);
        }
    }

    /**
     * Remove authorized mark from WS session by the key
     * @param key
     */
    removeAuthorized(key) {
        debug(`${this.removeAuthorized.name}: ${key}`);

        this.authorizedKeySet.delete(key);
    }

    /**
     * Get access and refresh token for by user credentials
     * @param key {string} - key
     * @param login {String} - user login
     * @param password {String} = user password
     * @returns {Promise}
     */
    createTokens(key, login, password) {
        debug(`${this.createTokens.name}: ${key}`);

        return this.send(key, {
                action: CONST.WS.ACTIONS.TOKEN,
                login: login,
                password: password
            })
            .then((tokens) => {
                this.setTokens(key, tokens);

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
        debug(`${this.authenticate.name}: ${key}`);

        return this.send(key, {
                action: CONST.WS.ACTIONS.AUTHENTICATE,
                token: accessToken
            })
            .then(() => {
                this.setAuthorized(key);
            });
    }

    /**
     * Send message object over WS session by the key
     * @param key
     * @param messageObject
     * @return {Promise}
     */
    send(key, messageObject) {
        debug(`${this.send.name}: ${key}`);

        this._lock(key);

        return this.wsFactory.getSocket(key)
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
                this._unlock(key);
                return response;
            })
            .catch((err) => {
                this._unlock(key);
                throw err;
            });
    }

    /**
     * Send string message (forward string message) over WS session by the key
     * @param key
     * @param stringMessage
     */
    sendString(key, stringMessage) {
        debug(`${this.sendString.name}: ${key}`);

        this._lock(key);

        this.wsFactory.getSocket(key)
            .then((wSocket) => {
                if (this.wsFactory.hasSocket(key)) {
                    wSocket.sendString(stringMessage, () => this._unlock(key));
                }
            });
    }

    /**
     * Close WS session by the key
     * @param key
     */
    close(key) {
        debug(`${this.close.name}: ${key}`);

        if (this._isLocked(key)) {
            this.once(`_unlock_${key}`, () => process.nextTick(() => this.close(key)));
        } else {
            this.removeAuthorized(key);
            this.keyLockCounterMap.delete(key);
            this.wsFactory.removeSocket(key);
        }
    }

    /**
     * Lock WS session resource
     * @param key
     */
    lock(key) {
        this._lock(key);
    }

    /**
     * Unlock WS session resource
     * @param key
     */
    unlock(key) {
        this._unlock(key);
    }

    /**
     * Lock WS session resource
     * @param key
     * @private
     */
    _lock(key) {
        debug(`${this._lock.name}: ${key}`);

        if (this.keyLockCounterMap.has(key)) {
            let counter = this.keyLockCounterMap.get(key);

            this.keyLockCounterMap.set(key, ++counter);

            if (counter === 1) {
                this.emit(`_lock_${key}`);
            }
        } else {
            this.keyLockCounterMap.set(key, 1);
        }
    }

    /**
     * Unlock WS session resource
     * @param key
     * @private
     */
    _unlock(key) {
        debug(`${this._unlock.name}: ${key}`);

        if (this.keyLockCounterMap.has(key)) {
            let counter = this.keyLockCounterMap.get(key);

            if (counter !== 0) {
                this.keyLockCounterMap.set(key, --counter);

                if (counter === 0) {
                    this.emit(`_unlock_${key}`);
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
        let result = false;

        if (this.keyLockCounterMap.has(key)) {
            result = this.keyLockCounterMap.get(key) !== 0;
        }

        return result
    }
}

module.exports = WebSocketManager;
