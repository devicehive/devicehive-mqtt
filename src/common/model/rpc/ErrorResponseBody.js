const Body = require(`./Body`);
const Action = require(`./Action`);

class ErrorResponseBody extends Body {

    constructor({ message, ...rest } = {}) {
        super({ action: Action.ERROR_RESPONSE, message, ...rest });

        const me = this;

        me.message = message;
    }

    get message() {
        return this._message;
    }

    set message(value) {
        this._message = value;
    }
}


module.exports = ErrorResponseBody;
