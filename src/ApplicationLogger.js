const winston = require(`winston`);

/**
 * Application logger facade class.
 */
class ApplicationLogger {
    /**
     * Create new ApplicationLogger
     * @param {string} loggingLevel
     */
    constructor(loggingLevel) {
        this.logger = winston.createLogger({
            level: loggingLevel,
            transports: [new winston.transports.Console()],
        });
    }

    /**
     * Error log
     * @param {string} str
     */
    err(str) {
        this.logger.error(str);
    }

    /**
     * Warning log
     * @param {string} str
     */
    warn(str) {
        this.logger.warn(str);
    }

    /**
     * Information log
     * @param {string} str
     */
    info(str) {
        this.logger.info(str);
    }

    /**
     * Debug log
     * @param {string} str
     */
    debug(str) {
        this.logger.debug(str);
    }
}

module.exports = ApplicationLogger;
