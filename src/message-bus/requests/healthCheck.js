const { Response } = require(`devicehive-message-bus-client`);
const HealthCheckRequestBody = require(`./models/HealthCheckRequestBody`);
const HealthCheckResponseBody = require(`./models/HealthCheckResponseBody`);


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
