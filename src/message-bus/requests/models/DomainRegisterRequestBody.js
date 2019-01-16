const Action = require(`./Action`);
const { Body } = require(`devicehive-message-bus-client`);


class DomainRegisterRequestBody extends Body {

    constructor({ domain, subDomain, topic, ...rest } = {}) {
        super({ action: Action.DOMAIN_REGISTER_REQUEST, domain, subDomain, topic, ...rest });

        this._domain = domain;
        this._subDomain = subDomain;
        this._topic = topic;
    }

    get domain() {
        return this._domain;
    }

    set domain(value) {
        this._domain = value;
    }

    get subDomain() {
        return this._subDomain;
    }

    set subDomain(value) {
        this._subDomain = value;
    }

    get topic() {
        return this._topic;
    }

    set topic(value) {
        this._topic = value;
    }
}


module.exports = DomainRegisterRequestBody;
