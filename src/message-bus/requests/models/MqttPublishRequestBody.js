const Action = require(`../../../message-bus/requests/models/Action`);
const { Body } = require(`devicehive-message-bus-client`);


class MqttPublishRequestBody extends Body {

    constructor({ domain, subDomain, clientId, data, ...rest } = {}) {
        super({ action: Action.MQTT_PUBLISH_REQUEST, domain, subDomain, clientId, data, ...rest });

        this._domain = domain;
        this._subDomain = subDomain;
        this._clientId = clientId;
        this._data = data;
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

    get clientId() {
        return this._clientId;
    }

    set clientId(value) {
        this._clientId = value;
    }

    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
    }
}


module.exports = MqttPublishRequestBody;
