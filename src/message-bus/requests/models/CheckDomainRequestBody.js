const Action = require(`../../../message-bus/requests/models/Action`);
const { Body } = require(`devicehive-message-bus-client`);


class DomainRegisterRequestBody extends Body {

    constructor({ domain, ...rest } = {}) {
        super({ action: Action.CHECK_DOMAIN_REQUEST, domain, ...rest });

        this._domain = domain;
    }

    get domain() {
        return this._domain;
    }

    set domain(value) {
        this._domain = value;
    }
}


module.exports = DomainRegisterRequestBody;
