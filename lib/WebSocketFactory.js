const EventEmitter = require('events');
const WebSocket = require('./WebSocket.js');

/**
 * WebSocket Factory. For supporting multiple users
 * @event message
 */
class WebSocketFactory extends EventEmitter {

    /**
     * Create WebSocketFactory
     * @param serverUrl
     */
    constructor(serverUrl) {
        super();

        const me = this;

        me.socketMap = new Map();
        me.url = serverUrl;
    }

    /**
     * Get WebSocket by key or create new WebSocket
     * @param key
     * @return {Promise}
     */
    getSocket(key) {
        const me = this;

        if (me.socketMap.has(key)) {
            const socket = me.socketMap.get(key);

            return Promise.resolve(socket);
        } else {
            const socket = new WebSocket(me.url);

            socket.addEventListener('message', (message) => me.emit('message', key, message));

            me.socketMap.set(key, socket);

            return new Promise((resolve) => socket.addEventListener('open', () => resolve(socket)));
        }
    }

    /**
     * Remove WebSocket by key
     * @param key
     */
    removeSocket(key) {
        const me = this;

        if (me.socketMap.has(key)) {
            me.socketMap.get(key).close();
            me.socketMap.delete(key);
        }
    }

    /**
     * Check for socket with such key
     * @param key
     * @return {boolean}
     */
    hasSocket(key) {
        const me = this;

        return me.socketMap.has(key);
    }

}

module.exports = WebSocketFactory;