const winston = require(`winston`);
const config = winston.config;

module.exports = new (winston.Logger)({
    levels: {
        info: 99,
        warn: 1,
        error: 2
    },
    colors: {
        info: `green`,
        warn: `yellow`,
        error: `red`
    },
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: () => (new Date()).toISOString(),
            formatter: (options) => {
                const pid = process.pid;
                const level = config.colorize(options.level, options.level.toUpperCase());
                const message = options.message;
                const timeStamp = config.colorize(options.level, options.timestamp());

                return `BROKER(${pid}) ${level}: ${message} --- ${timeStamp}`;
            }
        })
    ],
    filters: [(level, msg) => msg.replace(/(\r\n|\n|\r)/gm, ``)]
});