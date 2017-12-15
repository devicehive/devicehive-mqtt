[DeviceHive]: https://devicehive.com "DeviceHive framework"
[Mosca]: https://github.com/mcollina/mosca "Mosca"
[PM2]: https://github.com/Unitech/pm2 "PM2"
[debug]: https://github.com/visionmedia/debug "debug"
[Redis]: https://redis.io/ "Redis"
[Docker]: https://www.docker.com/ "Docker"
[Docker Compose]: https://docs.docker.com/compose/ "Docker Compose"
[Git]: https://git-scm.com/ "Git"
[NodeJS]: https://nodejs.org "NodeJS"
[WebSocket API]: https://docs.devicehive.com/docs/websocket-api-reference "WebSocket API"
[MQTT]: https://github.com/mqttjs/MQTT.js "MQTT"

# devicehive-mqtt
Additional resource:

[DeviceHive Official site](https://devicehive.com)  
[DeviceHive Official playground](https://playground.devicehive.com)

MQTT plugin for DeviceHive server
===
The **devicehive-mqtt** broker is a MQTT transport layer between MQTT clients and [DeviceHive] server.
The broker uses WebSocket sessions to communicate with [DeviceHive] Server and Redis server for persistence functionality.
The **devicehive-mqtt** broker supports _QOS0_ and _QOS2_, _retain messages_ and _last will_.
The **devicehive-mqtt** broker is powered by [Mosca] MQTT broker library.

Prerequisites
---
- [NodeJS] (>=8)
- [Redis]
- [Docker]
- [Docker Compose]
- [Git]
- cloned repository ( `git clone https://github.com/devicehive/devicehive-mqtt.git` )

Start Up
===
The **devicehive-mqtt** broker can be launched directly via node, docker container or docker-compose. 
With last choice is pretty easy to scale the broker horizontally.
Also you might to specify a set of environmental variables that are described in the next paragraph.

Environmental variables
---
 `NODE_ENV` - "prod" for production, "dev" for development  
 `BROKER_PORT` - port on wich broker will start (default: 1883)  
 `WS_SERVER_URL` - path to Web Socket server (default: ws://playground.devicehive.com/api/websocket)  
 `REDIS_SERVER_HOST` - Redis storage host (default: localhost)  
 `REDIS_SERVER_PORT` - Redis storage port (default: 6379)  
 `DEBUG` - [debug] modules logger (modules: subscriptionmanager, websocketfactory, websocketmanager)  
 `APP_LOG_LEVEL` - application logger level (levels: debug, info, warn, error)  
 `ENABLE_PM` - enable process monitoring with [PM2] module 
 
Run with Node
---
In the folder of cloned **devicehive-mqtt** repo run next commands:

Install all dependencies:

    npm install

Start broker:

    <environmental-variables-list> node ./src/broker.js

Where:

_environmental-variables-list_ - list of environmental variables, e.g. _NODE_ENV=prod,BROKER_PORT=1883,..._

Also, it's pretty useful to enable process monitoring with [PM2] module (ENABLE_PM environmental variables) and
start the broker via PM2.

Firstly, install the [PM2] globally:

    npm install -g pm2

Then run next command: 

    pm2 start ./src/broker.js

After that, you will be able to see monitoring information provided by [PM2] library.
Type the next command:

    pm2 monit

Run with Docker
---
In the folder of cloned **devicehive-mqtt** repo run next commands:

Build docker container by [Dockerfile](./Dockerfile) located in the root folder of cloned **devicehive-mqtt** repo:

    docker build -t <image-tag> .

Run docker container:

    docker run -p <external-port:1883> --env-file <path-to-env-file> <image-tag>

Where:

_path-to-env-file_ - path to file with mentioned environmental variables.
Do not specify BROKER_PORT variable. In the container it should be 1883, as by default.
_external-port_ - port that will be used to achieve the broker

Run with Docker Compose
---
To run **devicehive-mqtt** broker with Docker Compose there is a [docker-compose.yml](./docker-compose.yml) file.
You may edit this file in case you want change environment variables or add broker instances.

To run just type the next command:

    docker-compose up

Connecting and authentication
===
The [DeviceHive] provides few ways for authentication:
1) User _login_ and password
2) User _access token_

While connecting to the MQTT broker you can specify the username and password fields.
After that you will be able to work with both common MQTT resources and [DeviceHive] resources.

Also, you can connect to the MQTT broker without credentials. However, you will not be able 
to work with [DeviceHive] resources. From this state you are able to authenticate yourself with
user access token.

DeviceHive messaging structure projection on MQTT topic structure
===
[DeviceHive] has next structure entities:
- network
- device
- message type
    * notification
    * command

As far as the broker uses WebSocket to communicate with DeviceHive server 
you can use [WebSocket API] to build request data objects.
    
To mark topic as a private the MQTT client should add it's own clientId to the and of the topic over `@` sign
    
To make request the MQTT client should publish to the next topic:
  
    dh/request

To receive responses of request the MQTT client should subscribe to the response topics with request action mentioned:

    dh/response/<requestAction>@<clientID>

Where _requestAction_ ia a request action (**user/get**, **device/delete**, **token/refresh etc.**)
Response topic should be always private (e.g. with client ID mentioned)

The MQTT client is able to subscribe to the notification/command/command_update topic to receive notification/command/command_update push messages

    dh/notification/<networkID>/<deviceID>/<notificationName>[@<clientID>]
        
    dh/command/<networkID>/<deviceID>/<commandName>[@<clientID>]
    
    dh/command_update/<networkID>/<deviceID>/<commandName>[@<clientID>]

Where: 
- networkID - id of the network
- deviceID - id of the device
- notificationName - notification name
- commandName - command name

The **devicehive-mqtt** broker supports common wildcards in the topic ( +, #)

All topics that are starts with `dh` appraised by the broker as a DeviceHive topic.
All other topics are appraised as an ordinary MQTT topic.

Basic usages
===
In this small code snippets we are using [MQTT] as a client library.

_**Connection with username and password:**_
```javascript
    const mqtt = require('mqtt');

    const client  = mqtt.connect('mqtt://localhost:1883', {
        username: "<deviceHiveUserLogin>",
        password: "<deviceHiveUserPassword>"
    });
    
    client.on('connect', () => {
        //connection handler
    });
    
    client.on('error', () => {
        //error handler
    });
```

_**Connection without credentials, authentication with user access token:**_
```javascript
    const mqtt = require('mqtt');
    
    const client  = mqtt.connect('mqtt://localhost:1883');
    
    client.on('message', function (topic, message) {
        const messageObject = JSON.parse(message.toString());
        
        if (messageObject.requestId === '12345') {
            if (messageObject.status === 'success') {
                //client authenticated
            }
        }
    });
    
    client.on('connect', () => {
        client.subscribe('dh/response/authenticate@' + client.options.clientId);
        
        client.publish('dh/request', {
           action: 'authenticate',
           token: '<userAccessToken>',
           requestId: '12345'
        });
    });
    
    client.on('error', () => {
        //error handler
    });
```

_**Connection with username and password, subscription for notification and command push messages:**_
```javascript
    const mqtt = require('mqtt');
    
    const client  = mqtt.connect('mqtt://localhost:1883', {
        username: "<deviceHiveUserLogin>",
        password: "<deviceHiveUserPassword>"
    });
    
    client.on('message', function (topic, message) {
        const messageObject = JSON.parse(message.toString());
        
        //notification/command push messages
    });
        
    client.on('connect', () => {
        /* Subscribe for notification push messages with name = notificationName
            of device with id = deviceId on network with id = networkId */  
        client.subscribe('dh/notification/<networkId>/<deviceId>/<notificationName>');
        
        /* Subscribe for notification push messages with name = notificationName
            of any device on network with id = networkId */  
        client.subscribe('dh/notification/<networkId>/+/<notificationName>');
        
        /* Subscribe for command push messages with name = commandName
            of device with id = deviceId on network with id = networkId */  
        client.subscribe('dh/command/<networkId>/<deviceId>/<commandName>');
        
        /* Subscribe for command push messages on network with id = networkId
            for any device with any command name */  
        client.subscribe('dh/command/<networkId>/#');
    });
    
    client.on('error', () => {
        //error handler
    });
```

_**Connection without credentials subscription and publishing to the ordinary topics:**_
```javascript
    const mqtt = require('mqtt');
    
    const client  = mqtt.connect('mqtt://localhost:1883');
    
    client.on('message', function (topic, message) {
        const messageObject = JSON.parse(message.toString());
        
        // messages handler
    });
        
    client.on('connect', () => {
        client.subscribe('ordinary/topic');
        client.publish('another/ordinary/topic', {
            data: 'someData'
        });
    });
    
    client.on('error', () => {
        //error handler
    });
```

Tests
===
Unit tests:

    npm run unitTest
    
Integration tests (broker should be ran on localhost:1883):

    npm run integrationTest

