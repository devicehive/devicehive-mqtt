const proxyConfig = require(`../../config`).proxy;
const proxyClient = require(`./ProxyClient`);
const { MessageUtils, MessageBuilder } = require(`devicehive-proxy-message`);
const Request = require(`../common/model/rpc/Request`);
const Response = require(`../common/model/rpc/Response`);
const ErrorResponseBody = require(`../common/model/rpc/ErrorResponseBody`);
const RequestHandlerFactory = require(`./RequestHandlerFactory`);

proxyClient.on(`error`, (error) => {
    console.log(error);
});

proxyClient.on(`open`, () => {
    proxyClient.sendMessage(MessageBuilder.subscribeTopic({
        topicList: [ proxyConfig.REQUEST_TOPIC ],
        subscriptionGroup: proxyConfig.PROXY_SUBSCRIPTION_GROUP
    }));
});

proxyClient.on(`message`, async (message) => {
    if (message.type === MessageUtils.NOTIFICATION_TYPE) {
        const payload = message.payload;

        if (payload && payload.message) {
            try {
                const request = Request.normalize(JSON.parse(payload.message));
                let response;

                switch (request.type) {
                    case Request.PING_TYPE:
                        response = getPongResponse(request);
                        break;
                    case Request.CLIENT_REQUEST_TYPE:
                        response = await handleClientRequest(request);
                        break;
                    default:
                        response = getErrorResponse(request);
                        break;
                }

                proxyClient.sendMessage(MessageBuilder.createNotification({
                    topic: request.replyTo,
                    message: response.toString(),
                    partition: request.partitionKey,
                    type: MessageUtils.RESPONSE_NOTIFICATION
                }));
            } catch (error) {
                console.log(error.message);
            }

        }
    }
});


/**
 * Client request handler
 * @param request
 * @returns {Promise<Response>}
 */
async function handleClientRequest(request) {
    const requestHandler = RequestHandlerFactory.getHandlerByAction(request.body.action);
    let response = new Response();

    if (!requestHandler) {
        response = getErrorResponse(request, 500, `No corresponding request handler`);
    } else {
        try {
            response = await requestHandler(request);
        } catch (error) {
            response = getErrorResponse(request, 500, error.message)
        }
    }

    response.correlationId = request.correlationId;

    return response;
}

/**
 * Returns Response object for ping request
 * @param request
 * @returns {Response}
 */
function getPongResponse(request) {
    return new Response({ correlationId: request.correlationId });
}

/**
 * Returns ErrorResponse object
 * @param request
 * @param code
 * @param message
 * @returns {Response}
 */
function getErrorResponse(request, code, message) {
    return (new Response({
        correlationId: request.correlationId,
        failed: true
    }))
        .withErrorCode(code)
        .withBody(new ErrorResponseBody({message}));
}
