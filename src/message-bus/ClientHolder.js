const messageBusConfig = require(`../../config`).messageBus;
const { MessageBusClient } = require(`devicehive-message-bus-client`);
const RequestHandlerFactory = require(`./RequestHandlerFactory`);


module.exports = new MessageBusClient({
    webSocketServerUrl: messageBusConfig.WS_PROXY_ENDPOINT,
    autoReconnectIntervalMs: messageBusConfig.RECONNECTION_INTERVAL_MS,
    persistMessageWhileReconnecting: messageBusConfig.PERSIST_MESSAGE_WHILE_RECONNECTING,
    topicsToSubscribe: [ messageBusConfig.REQUEST_TOPIC ],
    subscriptionGroup: messageBusConfig.PROXY_SUBSCRIPTION_GROUP,
    handlerFactory: new RequestHandlerFactory()
});
