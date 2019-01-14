const MessageType = require(`./MessageType`);
const Request = require(`./Request`);
const Response = require(`./Response`);


/**
 *
 */
class IncomingMessage {
    /**
     *
     * @param mt
     * @param rest
     */
    static normalize({ mt, ...rest } = {}) {
        switch(mt) {
            case MessageType.REQUEST_MESSAGE_TYPE:
                return Request.normalize(rest);
            case MessageType.RESPONSE_MESSAGE_TYPE:
                return Response.normalize(rest);
        }
    }
}


module.exports = IncomingMessage;
