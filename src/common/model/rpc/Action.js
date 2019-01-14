/**
 * DeviceHive Action class
 */
class Action {
    static get EMPTY() { return 0; }
    static get ERROR_RESPONSE() { return 1; }

    static get HEALTH_CHECK_REQUEST() { return 2; }
    static get HEALTH_CHECK_RESPONSE() { return 3; }
}


module.exports = Action;
