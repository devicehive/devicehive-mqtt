const EventEmitter = require(`events`);
const cote = require(`cote`);
const randomString = require(`randomstring`);


/**
 * CrossBrokerCommunicator. Private Pub/Sub between broker instances
 * @event message - on message from other brokers
 */
class CrossBrokerCommunicator extends EventEmitter {

    /**
     * Create new CrossBrokerCommunicator
     */
    constructor() {
        super();

        const me = this;

        me.id = randomString.generate();
        me.publisher = new cote.Publisher({ name: `CrossBrokerCommunicator` });
        me.subscriber = new cote.Subscriber({ name: `CrossBrokerCommunicator` });

        me.subscriber.on(`message`, (data) => {
            if (data.id !== me.id) {
                me.emit(`message`, data.topic, data.payload);
            }
        });
    }

    /**
     * Publish data to other brokers
     * @param topic
     * @param payload
     */
    publish(topic, payload) {
        const me = this;

        me.publisher.publish(`message`, {
            topic: topic,
            payload: payload,
            id: me.id
        });
    }
}

module.exports = CrossBrokerCommunicator;