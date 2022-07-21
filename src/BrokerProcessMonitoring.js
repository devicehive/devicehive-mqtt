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
        this.connectedClients = 0;
        this.maximumClients = 0;
        this.connectionLoad = 0;
        this.publishingLoad = 0;
        this.heapCurrent = 0;
        this.heapMaximum = 0;
        this.publishedCount = 0;
        this.startAt = 0;

        this._addPmxProbeMetric(`uptime`, `Uptime`);
        this._addPmxProbeMetric(`connectedClients`, `Connected clients`);
        this._addPmxProbeMetric(`connectionLoad`, `Connection load (5 min)`);
        this._addPmxProbeMetric(`maximumClients`, `Maximum clients`);
        this._addPmxProbeMetric(`publishingLoad`, `Publishing load`);
        this._addPmxProbeMetric(`heapCurrent`, `Current heap`);
        this._addPmxProbeMetric(`heapMaximum`, `Maximum heap`);
        this._addPmxProbeMetric(`publishedCount`, `Publishing count (5 min)`);
        this._addPmxProbeMetric(`startAt`, `Start at`);
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
            case CONST.MQTT.BROKER_STATS_TOPICS.CLIENTS_CONNECTED:
                this.connectedClients = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.CLIENTS_MAXIMUM:
                this.maximumClients = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.LOAD_CONNECTIONS:
                this.connectionLoad = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.LOAD_PUBLISH_RECEIVED:
                this.publishingLoad = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.MEMORY_HEAP_CURRENT:
                this.heapCurrent = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.MEMORY_HEAP_MAXIMUM:
                this.heapMaximum = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.PUBLISH_RECEIVED:
                this.publishedCount = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.START_AT:
                this.startAt = value;
                break;
        }
    }
}

module.exports = BrokerProcessMonitoring;
