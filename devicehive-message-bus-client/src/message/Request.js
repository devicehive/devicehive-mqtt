const uuid = require('uuid/v1');
const MessageType = require(`./MessageType`);
const Body = require(`./body/Body`);


/**
 *
 */
class Request {

    static get CLIENT_REQUEST_TYPE() { return 0; }
    static get PING_TYPE() { return 1; }

    /**
     *
     * @param b
     * @param cId
     * @param pK
     * @param sre
     * @param rTo
     * @param t
     * @param rest
     */
    static normalize({b, cId, pK, sre, rTo, t, ...rest} = {}) {
        return new Request({
            body: Body.normalize(b ? b : {}),
            correlationId: cId,
            partitionKey: pK,
            singleReplyExpected: sre,
            replyTo: rTo,
            type: t,
            ...rest
        })
    }

    /**
     *
     * @param body
     * @param correlationId
     * @param partitionKey
     * @param singleReplyExpected
     * @param replyTo
     * @param type
     * @param rest
     */
    constructor({body={}, correlationId = uuid(), partitionKey, singleReplyExpected, replyTo, type, ...rest } = {}) {
        const me = this;

        me.body = body;
        me.correlationId = correlationId;
        me.partitionKey = partitionKey;
        me.singleReplyExpected = singleReplyExpected;
        me.replyTo = replyTo;
        me.type = type;

        Object.assign(this, rest);
    }

    get isRequest() {
        return true;
    }

    get messageType() {
        return MessageType.REQUEST_MESSAGE_TYPE;
    }

    get body() {
        const me = this;

        return me._body;
    }

    set body(value) {
        const me = this;

        me._body = value;
    }

    get correlationId() {
        const me = this;

        return me._correlationId;
    }

    set correlationId(value) {
        const me = this;

        me._correlationId = value;
    }

    get partitionKey() {
        const me = this;

        return me._partitionKey;
    }

    set partitionKey(value) {
        const me = this;

        me._partitionKey = value;
    }

    get singleReplyExpected() {
        const me = this;

        return me._singleReplyExpected;
    }

    set singleReplyExpected(value) {
        const me = this;

        me._singleReplyExpected = value;
    }

    get replyTo() {
        const me = this;


        return me._replyTo;
    }

    set replyTo(value) {
        const me = this;

        me._replyTo = value;
    }

    get type() {
        const me = this;

        return me._type;
    }

    set type(value) {
        const me = this;

        me._type = value;
    }

    /**
     *
     * @returns {boolean}
     */
    isPing() {
        const me = this;

        return me.type === Request.PING_TYPE;
    }

    /**
     *
     * @returns {boolean}
     */
    isClientRequest() {
        const me = this;

        return me.type === Request.CLIENT_REQUEST_TYPE;
    }

    /**
     *
     * @returns {{ mt: number, b: string, cId: *, pK: *, sre: *, rTo: *, t: *}}
     */
    toObject() {
        const me = this;

        return {
            mt: me.messageType,
            b: me.body.toString(),
            cId: me.correlationId,
            pK: me.partitionKey,
            sre: me.singleReplyExpected,
            rTo: me.replyTo,
            t: me.type
        }
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


module.exports = Request;
