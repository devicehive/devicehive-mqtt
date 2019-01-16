const EventEmitter = require(`events`);


class MessageBusDistributor extends EventEmitter {

    constructor() {
        super();

        this.domainRegister = new Map();
    }

    register(domain, subDomain, topic) {
        let domainRecordMap = this.domainRegister.get(domain);

        if (domainRecordMap) {
            if (domainRecordMap.has(subDomain)) {
                throw new Error(`Sub domain "${subDomain}" already registered`);
            } else {
                domainRecordMap.set(subDomain, topic);
            }
        } else {
            domainRecordMap = new Map();

            domainRecordMap.set(subDomain, topic);

            this.domainRegister.set(domain, domainRecordMap);
        }
    }

    unregister(domain, subDomain) {
        let domainRecordMap = this.domainRegister.get(domain);

        if (domainRecordMap) {
            if (domainRecordMap.has(subDomain)) {
                domainRecordMap.delete(subDomain)
            } else {
                throw new Error(`Sub domain "${subDomain}" is not registered`);
            }
        } else {
            throw new Error(`Domain "${domain}" is not registered`);
        }
    }

    isRegistered(domain) {
        return this.domainRegister.has(domain);
    }

    getDomainMap(domain) {
        return this.domainRegister.get(domain);
    }

    publish(domain, subDomain, clientId, data) {
        this.emit(`message`, domain, subDomain, clientId, data);
    }
}


module.exports = MessageBusDistributor;
