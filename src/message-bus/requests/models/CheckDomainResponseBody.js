const { Body } = require(`devicehive-message-bus-client`);
const Action = require(`./Action`);


class DomainRegisterResponseBody extends Body {

    constructor({ isRegistered, domainMap, ...rest } = {}) {
        super({ action: Action.CHECK_DOMAIN_RESPONSE, isRegistered, domainMap, ...rest });

        this._isRegistered = isRegistered;
        this._domainMap = domainMap;
    }

    get isRegistered() {
        return this._isRegistered;
    }

    set isRegistered(value) {
        this._isRegistered = value;
    }

    get domainMap() {
        return this._domainMap;
    }

    set domainMap(value) {
        this._domainMap = value;
    }
}


module.exports = DomainRegisterResponseBody;
