const EventEmitter = require('events');
const debug = require(`debug`)(`websocketfactory`);
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

        this.socketMap = new Map();
        this.url = serverUrl;

        debug(`${this.constructor.name}: ${serverUrl}`);
    }

    /**
     * Get WebSocket by key or create new WebSocket
     * @param key
     * @return {Promise}
     */
    getSocket(key) {
        if (this.socketMap.has(key)) {
            const socket = this.socketMap.get(key);

            debug(`${this.getSocket.name}: ${key}`);

            return Promise.resolve(socket);
        } else {
            const socket = new WebSocket(this.url);

            socket.addEventListener('message', (message) => this.emit('message', key, message));

            this.socketMap.set(key, socket);

            return new Promise((resolve) => socket.addEventListener('open', () => resolve(socket)));
        }
    }

    /**
     * Remove WebSocket by key
     * @param key
     */
    removeSocket(key) {
        debug(`${this.removeSocket.name}: ${key}`);

        if (this.socketMap.has(key)) {
            this.socketMap.get(key).close();
            this.socketMap.delete(key);
        }
    }

    /**
     * Check for socket with such key
     * @param key
     * @return {boolean}
     */
    hasSocket(key) {
        return this.socketMap.has(key);
    }

}

module.exports = WebSocketFactory;
