const winston = require(`winston`);
const config = winston.config;

const APP_LOG_LEVEL = process.env.APP_LOG_LEVEL || `info`;

/**
 * Application logger facade class.
 */
class ApplicationLogger {

    /**
     * Create new ApplicationLogger
     */
    constructor () {
        const me = this;
        const loggerConfig = {
            levels: {
                debug: 3,
                info: 2,
                warn: 1,
                error: 0
            },
            colors: {
                debug: `yellow`,
                info: `green`,
                warn: `red`,
                error: `red`
            },
            transports: [
                new (winston.transports.Console)({
                    colorize: true,
                    level: APP_LOG_LEVEL,
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
        };

        me.logger = new (winston.Logger)(loggerConfig);
    }

    /**
     * Error log
     * @param str
     */
    err (str) {
        const me = this;

        me.logger.error(str);
    }

    /**
     * Warning log
     * @param str
     */
    warn (str) {
        const me = this;

        me.logger.warn(str);
    }

    /**
     * Information log
     * @param str
     */
    info (str) {
        const me = this;

        me.logger.info(str);
    }

    /**
     * Debug log
     * @param str
     */
    debug (str) {
        const me = this;

        me.logger.debug(str);
    }
}


module.exports = ApplicationLogger;