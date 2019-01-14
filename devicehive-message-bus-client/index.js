module.exports = {
    MessageBusClient: require(`./src/Client`),
    Request: require(`./src/message/Request`),
    Response: require(`./src/message/Response`),
    Action: require(`./src/message/Action`),
    Body: require(`./src/message/body/Body`),
    ErrorResponseBody: require(`./src/message/body/ErrorResponseBody`),
    HandlerFactory: require(`./src/HandlerFactory`),
};