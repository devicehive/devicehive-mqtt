const winston = require(`winston`);


/**
 * Application logger facade class.
 */
class ApplicationLogger {

    /**
     * Create new ApplicationLogger
     */
    constructor (loggingLevel) {
        this.logger = winston.createLogger({
            level: loggingLevel,
            transports: [
                new winston.transports.Console()
            ]
        });
    }

    /**
     * Error log
     * @param str
     */
    err (str) {
        this.logger.error(str);
    }

    /**
     * Warning log
     * @param str
     */
    warn (str) {
        this.logger.warn(str);
    }

    /**
     * Information log
     * @param str
     */
    info (str) {
        this.logger.info(str);
    }

    /**
     * Debug log
     * @param str
     */
    debug (str) {
        this.logger.debug(str);
    }
}


module.exports = ApplicationLogger;
