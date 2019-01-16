const { Response, ErrorResponseBody } = require(`devicehive-message-bus-client`);
const MqttPublishRequestBody = require(`./models/MqttPublishRequestBody`);
const MqttPublishResponseBody = require(`./models/MqttPublishResponseBody`);
const messageBusDistributor = require(`../DistributorHolder`);


/**
 * Device list request handler
 * @param request
 * @returns {Promise<void>}
 */
module.exports = async (request) => {
    const domainRegisterRequestBody = new MqttPublishRequestBody(request.body);
    const response = new Response();

    messageBusDistributor.publish(
        domainRegisterRequestBody.domain,
        domainRegisterRequestBody.subDomain,
        domainRegisterRequestBody.clientId,
        domainRegisterRequestBody.data
    );

    response.errorCode = 0;
    response.failed = false;
    response.withBody(new MqttPublishResponseBody());

    return response;
};
