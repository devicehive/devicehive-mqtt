const Response = require(`../../common/model/rpc/Response`);
const HealthCheckRequestBody = require(`../../common/model/rpc/HealthCheckRequestBody`);
const HealthCheckResponseBody = require(`../../common/model/rpc/HealthCheckResponseBody`);


/**
 * Device list request handler
 * @param request
 * @returns {Promise<void>}
 */
module.exports = async (request) => {
    const healthCheckRequestBody = new HealthCheckRequestBody(request.body);
    const response = new Response();

    response.errorCode = 0;
    response.failed = false;
    response.withBody(new HealthCheckResponseBody());

    return response;
};
