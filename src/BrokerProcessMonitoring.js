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
        const me = this;

        me.uptime = 0;
        me.connectedClients = 0;
        me.maximumClients = 0;
        me.connectionLoad = 0;
        me.publishingLoad = 0;
        me.heapCurrent = 0;
        me.heapMaximum = 0;
        me.publishedCount = 0;
        me.startAt = 0;

        me._addPmxProbeMetric(`uptime`, `Uptime`);
        me._addPmxProbeMetric(`connectedClients`, `Connected clients`);
        me._addPmxProbeMetric(`connectionLoad`, `Connection load (5 min)`);
        me._addPmxProbeMetric(`maximumClients`, `Maximum clients`);
        me._addPmxProbeMetric(`publishingLoad`, `Publishing load`);
        me._addPmxProbeMetric(`heapCurrent`, `Current heap`);
        me._addPmxProbeMetric(`heapMaximum`, `Maximum heap`);
        me._addPmxProbeMetric(`publishedCount`, `Publishing count (5 min)`);
        me._addPmxProbeMetric(`startAt`, `Start at`);
    }

    /**
     * Add PMX metric
     * @param metricName
     * @param description
     * @private
     */
    _addPmxProbeMetric(metricName, description) {
        const me = this;

        me[`${metricName}Metric`] = probe.metric({
            name: description,
            value: function () {
                return me[metricName];
            }
        });
    }

    /**
     * Update process metric
     * @param metricName
     * @param value
     */
    updateMetric (metricName, value) {
        const me = this;

        switch (metricName) {
            case CONST.MQTT.BROKER_STATS_TOPICS.UPTIME:
                me.uptime = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.CLIENTS_CONNECTED:
                me.connectedClients = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.CLIENTS_MAXIMUM:
                me.maximumClients = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.LOAD_CONNECTIONS:
                me.connectionLoad = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.LOAD_PUBLISH_RECEIVED:
                me.publishingLoad = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.MEMORY_HEAP_CURRENT:
                me.heapCurrent = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.MEMORY_HEAP_MAXIMUM:
                me.heapMaximum = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.PUBLISH_RECEIVED:
                me.publishedCount = value;
                break;
            case CONST.MQTT.BROKER_STATS_TOPICS.START_AT:
                me.startAt = value;
                break;
        }
    }
}

module.exports = BrokerProcessMonitoring;