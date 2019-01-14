const { Body } = require(`devicehive-message-bus-client`);
const Action = require(`./Action`);


class HealthCheckResponseBody extends Body {

    constructor({ ...rest } = {}) {
        super({ action: Action.HEALTH_CHECK_RESPONSE, ...rest });
    }
}


module.exports = HealthCheckResponseBody;
