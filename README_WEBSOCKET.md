## WebSocket:

### WebSocket Connection Configurations
```

WEBSOCKET_ENDPOINT - setting the endpoint for connecting to WebSocket, the default value is '/websocketnotification'
```
## Broker

### Local development:

SimpleBrocker is the default broker.

Locally, it is recommended to use SimpleBroker, as it is designed to operate on a single node and utilizes the node's memory to store the queue.
### Production:

For cluster deployment, it is recommended to activate ActiveMQ, as SimpleBroker stores the queue in the application's memory, which may lead to incorrect behavior in the cluster. In turn, ActiveMQ stores the queue in its own memory.

To activate ActiveMQ you need to add dependencies.
 ```
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-activemq</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-reactor-netty</artifactId>
</dependency>
```
and set the BROKER_TYPE environment variable to the 'activemq' value

```
BROKER_TYPE:activemq The default connection host is 'simple'
```

Other configurations ActiveMQ:

```
ACTIVEMQ_ADMIN_LOGIN: The default admin login is 'admin'
ACTIVEMQ_ADMIN_PASSWORD: The default administrator password is 'admin'
ACTIVEMQ_HOST: The default connection host is 'activemq'
ACTIVEMQ_PORT: The default connection port is '61616'
STOMP_PORT: The default STOMP connection port is '61613'
```