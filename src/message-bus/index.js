const { MessageUtils, MessageBuilder } = require(`devicehive-proxy-message`);
const messageBusClient = require(`./ClientHolder`);
const messageBusDistributor = require('./DistributorHolder');


messageBusClient.on(`ready`, () => {

});


module.exports = { messageBusDistributor };
