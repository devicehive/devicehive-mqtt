const { Body } = require(`devicehive-message-bus-client`);
const Action = require(`./Action`);


class DomainRegisterResponseBody extends Body {

    constructor({ ...rest } = {}) {
        super({ action: Action.DOMAIN_REGISTER_RESPONSE, ...rest });
    }
}


module.exports = DomainRegisterResponseBody;
