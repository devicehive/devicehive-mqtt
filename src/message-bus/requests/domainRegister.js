const { Response, ErrorResponseBody } = require(`devicehive-message-bus-client`);
const DomainRegisterRequestBody = require(`./models/DomainRegisterRequestBody`);
const DomainRegisterResponseBody = require(`./models/DomainRegisterResponseBody`);
const messageBusDistributor = require(`../DistributorHolder`);


/**
 * Device list request handler
 * @param request
 * @returns {Promise<void>}
 */
module.exports = async (request) => {
    const domainRegisterRequestBody = new DomainRegisterRequestBody(request.body);
    const response = new Response();

    messageBusDistributor.register(
        domainRegisterRequestBody.domain,
        domainRegisterRequestBody.subDomain,
        domainRegisterRequestBody.topic);


    response.errorCode = 0;
    response.failed = false;
    response.withBody(new DomainRegisterResponseBody());

    return response;
};
