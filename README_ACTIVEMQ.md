### WebSocket:

The default broker is SimpleBroker Spring implementation, to activate ActiveMQ you need to add dependencies

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
and convert the ACTIVEMQ_BROKER_TYPE environment variable to the 'activemq' value

```
ACTIVEMQ_BROKER_TYPE:activemq
```

## Other configurations:

```
ACTIVEMQ_ADMIN_LOGIN: The default admin login is 'admin'
ACTIVEMQ_ADMIN_PASSWORD: The default administrator password is 'admin'
ACTIVEMQ_HOST: The default connection host is 'activemq'
ACTIVEMQ_PORT: The default connection port is '61616'
STOMP_PORT: The default STOMP connection port is '61613'
```