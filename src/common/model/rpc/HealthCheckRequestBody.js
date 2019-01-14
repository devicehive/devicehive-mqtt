const Body = require(`./Body`);


class HealthCheckRequestBody extends Body {

    constructor({ deviceCommand, ...rest } = {}) {
        super({ ...rest });
    }
}


module.exports = HealthCheckRequestBody;
