const { Body } = require(`devicehive-message-bus-client`);


class HealthCheckRequestBody extends Body {

    constructor({ ...rest } = {}) {
        super({ ...rest });
    }
}


module.exports = HealthCheckRequestBody;
