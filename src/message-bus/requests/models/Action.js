/**
 * DeviceHive Action class
 */
class Action {
    static get EMPTY() { return 0; }
    static get ERROR_RESPONSE() { return 1; }

    static get HEALTH_CHECK_REQUEST() { return 2; }
    static get HEALTH_CHECK_RESPONSE() { return 3; }

    static get DOMAIN_REGISTER_REQUEST() { return 4; }
    static get DOMAIN_REGISTER_RESPONSE() { return 5; }

    static get CHECK_DOMAIN_REQUEST() { return 6; }
    static get CHECK_DOMAIN_RESPONSE() { return 7; }

    static get MQTT_PUBLISH_REQUEST() { return 8; }
    static get MQTT_PUBLISH__RESPONSE() { return 9; }
}


module.exports = Action;
