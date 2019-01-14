/**
 * Handler class
 */
class HandlerFactory {

    /**
     * Returns request handler by request action
     * @param action
     * @returns {Function}
     */
    getHandlerByAction(action) {
        throw new Error(`Method "getHandlerByAction" of class "RequestHandlerFactory" should be implemented`);
    }
}


module.exports = HandlerFactory;
