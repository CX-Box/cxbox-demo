package org.demo.conf.cxbox.websocket;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "spring.activemq")
@Getter
@Setter
public class ActiveMQConfigurationsProperties {

	private String password;

	private String user;

	private Integer stompPost;

	private String host;
}
