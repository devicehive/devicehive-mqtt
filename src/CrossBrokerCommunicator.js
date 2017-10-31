// const EventEmitter = require(`events`);
// const seneca = require(`seneca`);
//
//
// /**
//  *
//  */
// class CrossBrokerCommunicator extends EventEmitter {
//
//     /**
//      *
//      * @param inboundPort
//      * @param outboundPorts
//      */
//     constructor(inboundPort, outboundUrls = []) {
//         super();
//
//         const me = this;
//
//         me.out = outboundUrls;
//
//         me.seneca = seneca()
//             .add(`b:${inboundPort}`, (msg, done) => {
//                 me.emit(`message`, msg.data.topic, msg.data.payload);
//                 done();
//             })
//             .listen(inboundPort);
//
//         me.out.forEach((outboundUrl) => {
//             const [outboundHost, outboundPort] = outboundUrl.split(`:`);
//             me.seneca.client({ port: outboundPort, host: outboundHost });
//         });
//     }
//
//     /**
//      *
//      * @param topic
//      * @param payload
//      */
//     publish(topic, payload) {
//         const me = this;
//
//         me.out.forEach((outboundUrl) => {
//             me.seneca.act(`b:${outboundUrl.split(':')[1]}`, {
//                 data: {
//                     topic: topic,
//                     payload: payload
//                 }
//             });
//         });
//     }
// }
//
// module.exports = CrossBrokerCommunicator;


const EventEmitter = require(`events`);
const cote = require(`cote`);
const randomString = require(`randomstring`);


/**
 *
 */
class CrossBrokerCommunicator extends EventEmitter {

    /**
     *
     */
    constructor() {
        super();

        const me = this;

        me.id = randomString.generate();
        me.publisher = new cote.Publisher({ name: 'CrossBrokerCommunicator' });
        me.subscriber = new cote.Subscriber({ name: 'CrossBrokerCommunicator' });

        me.subscriber.on('message', (data) => {
            if (data.id !== me.id) {
                me.emit(`message`, data.topic, data.payload);
            }
        });
    }

    /**
     *
     * @param topic
     * @param payload
     */
    publish(topic, payload) {
        const me = this;

        me.publisher.publish('message', {
            topic: topic,
            payload: payload,
            id: me.id
        });
    }
}

module.exports = CrossBrokerCommunicator;