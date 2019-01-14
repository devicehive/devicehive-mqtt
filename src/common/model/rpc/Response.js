const Body = require(`./Body`);


/**
 *
 */
class Response {

    /**
     *
     * @param data
     */
    static normalize(data) {
        return new Response({
            body: Body.normalize(data.b ? JSON.parse(data.b) : {}),
            correlationId: data.cId,
            last: data.l,
            errorCode: data.err,
            failed: data.fld
        })
    }

    /**
     *
     * @param body
     * @param correlationId
     * @param last
     * @param errorCode
     * @param failed
     */
    constructor({ body, correlationId, last, errorCode = 0, failed } = {}) {
        const me = this;

        me.body = body;
        me.correlationId = correlationId;
        me.last = last;
        me.errorCode = errorCode;
        me.failed = failed;
    }

    get body() {
        const me = this;

        return me._body;
    }

    set body(value) {
        const me = this;

        me._body = value ? new Body(value) : undefined;
    }

    get correlationId() {
        const me = this;

        return me._correlationId;
    }

    set correlationId(value) {
        const me = this;

        me._correlationId = value;
    }

    get last() {
        const me = this;

        return me._last;
    }

    set last(value) {
        const me = this;

        me._last = value;
    }

    get errorCode() {
        const me = this;

        return me._errorCode;
    }

    set errorCode(value) {
        const me = this;

        me._errorCode = value;
    }

    get failed() {
        const me = this;

        return me._failed;
    }

    set failed(value) {
        const me = this;

        me._failed = value;
    }

    /**
     *
     * @param value
     * @returns {*}
     */
    withBody(value) {
        const me = this;

        me.body = value;

        return me.body;
    }

    /**
     *
     * @param value
     * @returns {Response}
     */
    withErrorCode(value) {
        const me = this;

        me.errorCode = value;

        return me;
    }

    /**
     *
     * @returns {{b: undefined, cId: *, l: *, err: *, fld: *}}
     */
    toObject() {
        const me = this;

        return {
          b: me.body ? me.body.toObject() : undefined,
          cId: me.correlationId,
          l: me.last,
          err: me.errorCode,
          fld: me.failed
        };
    }

    /**
     *
     * @returns {string}
     */
    toString() {
        const me = this;

        return JSON.stringify(me.toObject());
    }
}


module.exports = Response;
