const path = require(`path`);
const configurator = require(`json-evn-configurator`);

module.exports = {
    test: {
        integration: configurator(
            path.join(__dirname, `../integration/config.json`),
            `INTEGRATION_TEST`
        ),
    },
};
