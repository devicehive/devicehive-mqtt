
/**
 * Utility methods class
 */
class Utils {

    static get MS_IN_S() { return 1000; }
    static get B_IN_MB() { return 1024 * 1024; }
    static get EMPTY_STRING() { return ``; }

    /**
     * Iterate item or array of items
     * @param array
     * @param callback
     */
    static forEach(array, callback) {
        if (Array.isArray(array)) {
            array.forEach(callback);
        } else {
            callback(array);
        }
    }

    /**
     * Convert single item as array with one element or just returns array in case of array
     * @param array
     * @returns {*}
     */
    static toArray(array) {
        if (Array.isArray(array)) {
            return array;
        } else {
            return [array];
        }
    }

    /**
     * Checks is variable not undefined or null
     * @param variable
     * @returns {boolean}
     */
    static isDefined(variable) {
        return !(typeof variable === 'undefined' || variable === null);
    }

    /**
     * Returns value if it's defined, not null, and not an empty string, or else returns defaultValue
     * @param value
     * @param defaultValue
     * @returns {*}
     */
    static value(value, defaultValue) {
        return (Utils.isDefined(value) && value !== ``) ? value : defaultValue;
    }


    /**
     * Checks that value is true or "true"
     * @param value
     * @returns {Boolean}
     */
    static isTrue(value) {
        return value === true ? true : (value === `true`);
    }
}


module.exports = Utils;