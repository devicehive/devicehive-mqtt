const proxyConfig = require(`../../config`).proxy;
const { MessageBusClient } = require(`devicehive-message-bus-client`);
const RequestHandlerFactory = require(`./RequestHandlerFactory`);


module.exports = new MessageBusClient({
    webSocketServerUrl: proxyConfig.WS_PROXY_ENDPOINT,
    autoReconnectIntervalMs: proxyConfig.RECONNECTION_INTERVAL_MS,
    persistMessageWhileReconnecting: proxyConfig.PERSIST_MESSAGE_WHILE_RECONNECTING,
    topicsToSubscribe: [ proxyConfig.REQUEST_TOPIC ],
    subscriptionGroup: proxyConfig.PROXY_SUBSCRIPTION_GROUP,
    handlerFactory: new RequestHandlerFactory()
});
