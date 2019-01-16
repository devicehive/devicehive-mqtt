const path = require(`path`);
const configurator = require(`json-evn-configurator`);


module.exports = {
    broker: configurator(path.join(__dirname, `../src/config.json`), `BROKER`),
    messageBus: configurator(path.join(__dirname, `../src/message-bus/config.json`), `MESSAGE_BUS`)
};
