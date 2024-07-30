package org.demo.conf.websocket;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.activemq")
@Getter
@Setter
public class ActiveMQConfigurationsProperties {

	private String password;

	private String user;

	private String host;

}
