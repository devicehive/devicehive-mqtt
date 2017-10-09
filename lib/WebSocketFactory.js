let WebSocket = require('./WebSocket.js');

/**
 * WebSocket Factory. For supporting multiple users
 */
class WebSocketFactory {

    /**
     * Create WebSocketFactory
     * @param serverUrl {String}
     */
    constructor(serverUrl) {
        this.socketMap = new Map();
        this.url = serverUrl;
    }

    /**
     * Get WebSocket by key or create new WebSocket
     * @param key
     * @returns {WebSocket}
     */
    getSocket(key) {
        let me = this;

        if (me.socketMap.has(key)) {
            return Promise.resolve(me.socketMap.get(key))
        } else {
            let ws = new WebSocket(me.url);

            me.socketMap.set(key, ws);

            return new Promise((resolve, reject) => {
                ws.addEventListener('open', () => {
                    resolve(ws);
                })
            })
        }
    }

    /**
     * Remove WebSocket by key
     * @param key
     */
    removeSocket(key) {
        let me = this;

        if (me.socketMap.has(key)) {
            me.socketMap.get(key)
                .close()
                .then(() => {
                    me.socketMap.delete(key);
                });
        }
    }
}

module.exports = WebSocketFactory;