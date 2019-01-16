const { Response, ErrorResponseBody } = require(`devicehive-message-bus-client`);
const CheckDomainRequestBody = require(`./models/CheckDomainRequestBody`);
const CheckDomainResponseBody = require(`./models/CheckDomainResponseBody`);
const messageBusDistributor = require(`../DistributorHolder`);


/**
 * Device list request handler
 * @param request
 * @returns {Promise<void>}
 */
module.exports = async (request) => {
    const domainRegisterRequestBody = new CheckDomainRequestBody(request.body);
    const response = new Response();

    let isRegistered = false;
    let domainMap = {};
    const domainMapObject = messageBusDistributor.getDomainMap(domainRegisterRequestBody.domain);

    if (domainMapObject) {
        isRegistered = true;

        domainMapObject.forEach((value, key) => {
            domainMap[key] = value;
        });
    }

    response.errorCode = 0;
    response.failed = false;
    response.withBody(new CheckDomainResponseBody({
        isRegistered: isRegistered,
        domainMap: domainMap
    }));

    return response;
};
