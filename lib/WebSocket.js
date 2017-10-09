let WS = require('ws');
const randomstring = require('randomstring');

/**
 * WebSocket class wrapper
 */
class WebSocket {

    /**
     * Create WebSocket
     * @param serverURL
     */
    constructor (serverURL) {
        this.ws = new WS(serverURL);
        this.accessToken = '';
        this.refreshToken = '';
    }

    /**
     * Close WebSocket session
     * @returns {Promise}
     */
    close () {
        let me = this;

        return new Promise((resolve, reject) => {
            me.ws.addEventListener(`close`, () => {
                resolve();
            });

            me.ws.close();
        });
    }

    /**
     * Add event listener for WebSocket
     * @param eventName {String}
     * @param callback {Function}
     */
    addEventListener (eventName, callback) {
        let me = this;

        me.ws.addEventListener(eventName, callback);
    }

    /**
     * Send data
     * @param params {Object}
     * @returns {Promise}
     */
    send (params){
        let me = this;

        return new Promise((resolve, reject) => {
            if (!params.requestId){
                params.requestId = randomstring.generate();
            }

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
        let me = this;

        return me.send({
            action: `token`,
            login: login,
            password: password
        }).then(({accessToken, refreshToken}) => {
            me.accessToken = accessToken;
            me.refreshToken = refreshToken;

            return {accessToken, refreshToken};
        });
    }

    /**
     * Authenticate user by accessToken
     * @param accessToken
     * @returns {Promise}
     */
    authenticate (accessToken) {
        let me = this;

        return me.send({
            action : `authenticate`,
            token : accessToken
        })
    }
}

module.exports = WebSocket;