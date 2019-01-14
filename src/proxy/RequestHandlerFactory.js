const Action = require(`../common/model/rpc/Action`);
const healthCheckHandler = require(`./requests/healthCheck`);


const actionToHandlerMap = new Map();

actionToHandlerMap.set(Action.HEALTH_CHECK_REQUEST, healthCheckHandler);


/**
 * Request handler class
 */
class RequestHandlerFactory {

    /**
     * Returns request handler by request action
     * @param action
     * @returns {Function}
     */
    static getHandlerByAction(action) {
        return actionToHandlerMap.get(action);
    }
}


module.exports = RequestHandlerFactory;
