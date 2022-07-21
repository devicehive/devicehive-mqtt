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

        this.id = randomString.generate();
        this.publisher = new cote.Publisher({ name: `CrossBrokerCommunicator` });
        this.subscriber = new cote.Subscriber({ name: `CrossBrokerCommunicator` });

        this.subscriber.on(`message`, (data) => {
            if (data.id !== this.id) {
                this.emit(`message`, data.topic, data.payload);
            }
        });
    }

    /**
     * Publish data to other brokers
     * @param topic
     * @param payload
     */
    publish(topic, payload) {
        this.publisher.publish(`message`, {
            topic: topic,
            payload: payload,
            id: this.id
        });
    }
}

module.exports = CrossBrokerCommunicator;
