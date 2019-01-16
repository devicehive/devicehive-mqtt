const Action = require(`./requests/models/Action`);
const healthCheckHandler = require(`./requests/healthCheck`);
const domainRegisterHandler = require(`./requests/domainRegister`);
const checkDomainHandler = require(`./requests/checkDomain`);
const publishMessageHandler = require(`./requests/publishMessage`);


/**
 * Request handler class
 */
class RequestHandlerFactory {

    constructor() {
        this.actionToHandlerMap = new Map();

        this.actionToHandlerMap.set(Action.HEALTH_CHECK_REQUEST, healthCheckHandler);
        this.actionToHandlerMap.set(Action.DOMAIN_REGISTER_REQUEST, domainRegisterHandler);
        this.actionToHandlerMap.set(Action.CHECK_DOMAIN_REQUEST, checkDomainHandler);
        this.actionToHandlerMap.set(Action.MQTT_PUBLISH_REQUEST, publishMessageHandler);
    }

    /**
     * Returns request handler by request action
     * @param action
     * @returns {Function}
     */
    getHandlerByAction(action) {
        return this.actionToHandlerMap.get(action);
    }
}


module.exports = RequestHandlerFactory;
