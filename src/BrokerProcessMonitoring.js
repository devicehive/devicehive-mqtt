const CONST = require('../util/constants.json');
const probe = require('pmx').probe();

/**
 * Class for monitoring broker process
 */
class BrokerProcessMonitoring {

    /**
     * Create new BrokerProcessMonitoring
     */
    constructor () {
        this.uptime = 0;
        this.time = "";
        this.clientsTotal = 0;
        this.clientsMaximum = 0;
        this.publishedCount = 0;
        this.heapCurrent = 0;
        this.heapMaximum = 0;
        this.cpuUsage = 0;
        this.cpuAvg1 = 0;
        this.cpuAvg5 = 0;
        this.cpuAvg15 = 0;

        this._addPmxProbeMetric(`uptime`, `Uptime`);
        this._addPmxProbeMetric(`time`, `Broker time`);
        this._addPmxProbeMetric(`clientsTotal`, `Total connections`);
        this._addPmxProbeMetric(`clientsMaximum`, `Maximum connections`);
        this._addPmxProbeMetric(`publishedCount`, `Publishing count`);
        this._addPmxProbeMetric(`heapCurrent`, `Current heap`);
        this._addPmxProbeMetric(`heapMaximum`, `Maximum heap`);
        this._addPmxProbeMetric(`cpuUsage`, `Current CPU usage`);
        this._addPmxProbeMetric(`cpuAvg1`, `Average CPU usage (1min)`);
        this._addPmxProbeMetric(`cpuAvg5`, `Average CPU usage (5min)`);
        this._addPmxProbeMetric(`cpuAvg15`, `Average CPU usage (15min)`);
    }

    /**
     * Add PMX metric
     * @param metricName
     * @param description
     * @private
     */
    _addPmxProbeMetric(metricName, description) {
        this[`${metricName}Metric`] = probe.metric({
            name: description,
            value: () => {
                return this[metricName];
            }
        });
    }

    /**
     * Update process metric
     * @param metricName
     * @param value
     */
    updateMetric (metricName, value) {
        switch (metricName) {
            case CONST.MQTT.BROKER_STATS_TOPICS.UPTIME:
                this.uptime = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.TIME:
                this.time = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.CLIENTS_TOTAL:
                this.clientsTotal = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.CLIENTS_MAXIMUM:
                this.clientsMaximum = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.PUBLISH_SENT:
                this.publishedCount = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.MEMORY_HEAP_CURRENT:
                this.heapCurrent = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.MEMORY_HEAP_MAXIMUM:
                this.heapMaximum = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.CPU_USAGE:
                this.cpuUsage = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.CPU_AVG_1:
                this.cpuAvg1 = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.CPU_AVG_5:
                this.cpuAvg5 = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.CPU_AVG_15:
                this.cpuAvg15 = value;
                break;
        }
    }
}

module.exports = BrokerProcessMonitoring;
