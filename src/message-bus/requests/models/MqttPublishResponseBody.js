const { Body } = require(`devicehive-message-bus-client`);
const Action = require(`../../../message-bus/requests/models/Action`);


class MqttPublishResponseBody extends Body {

    constructor({ ...rest } = {}) {
        super({ action: Action.MQTT_PUBLISH__RESPONSE, ...rest });
    }
}


module.exports = MqttPublishResponseBody;
