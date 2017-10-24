const EventEmitter = require(`events`);
const WebSocketFactory = require(`./WebSocketFactory.js`);


/**
 *
 */
class WebSocketManager extends EventEmitter {

    /**
     *
     * @param wsURL
     */
    constructor(wsURL) {
        super();

        const me = this;

        me.keyTokensMap = new Map();
        me.keyLockCounterMap = new Map();
        me.wsFactory = new WebSocketFactory(wsURL);

        me.wsFactory.on(`message`, (key, message) => me.emit(`message`, key, message));
    }

    /**
     *
     * @param key
     * @return {boolean}
     */
    hasKey(key) {
        const me = this;

        return me.wsFactory.hasSocket(key);
    }

    /**
     *
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
     *
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
     *
     * @param key
     * @param message
     * @return {Promise}
     */
    send(key, message) {
        const me = this;

        me._lock(key);

        return me.wsFactory.getSocket(key)
            .then((wSocket) => {
                return wSocket.send(message);
            })
            .then((response) => {
                me._unlock(key);
                return response;
            })
            .catch((err) => {
                me._unlock(key);
                console.warn(err);
            });
    }

    /**
     *
     * @param key
     * @param stringMessage
     */
    sendString(key, stringMessage) {
        const me = this;

        me._lock(key);

        me.wsFactory.getSocket(key)
            .then((wSocket) => {
                if (me.wsFactory.hasSocket(key)) {
                    wSocket.sendString(stringMessage, () => me._unlock(key));
                }
            });
    }

    /**
     *
     * @param key
     */
    close(key) {
        const me = this;

        if (me._isLocked(key)) {
            me.once(`_unlock_${key}`, () => process.nextTick(() => me.close(key)));
        } else {
            me.keyLockCounterMap.delete(key);
            me.wsFactory.removeSocket(key);
        }
    }

    /**
     *
     * @param key
     * @private
     */
    _lock (key) {
        const me = this;

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
     *
     * @param key
     * @private
     */
    _unlock (key) {
        const me = this;

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
     *
     * @param key
     * @return {boolean}
     * @private
     */
    _isLocked (key) {
        const me = this;
        let result = false;

        if (me.keyLockCounterMap.has(key)) {
            result = me.keyLockCounterMap.get(key) !== 0;
        }

        return result
    }
}

module.exports = WebSocketManager;