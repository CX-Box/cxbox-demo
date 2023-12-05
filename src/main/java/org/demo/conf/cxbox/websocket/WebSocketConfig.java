package org.demo.conf.cxbox.websocket;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@RequiredArgsConstructor
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	private final ActiveMQConfigurationsProperties properties;

	@Value("${spring.websocket.prefix}")
	private String prefix;

	@Value("${app.broker-type}")
	private String brokerType;

	@Value("${spring.websocket.endpointToConnect}")
	private String endpointToConnect;

	@Value("${cxbox.api.path}")
	private String api;

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		if ("activemq".equalsIgnoreCase(brokerType)) {
			config.enableStompBrokerRelay(prefix)
					.setRelayHost(properties.getHost())
					.setClientLogin(properties.getUser())
					.setRelayPort(properties.getStompPost())
					.setClientPasscode(properties.getPassword())
					.setSystemLogin(properties.getUser())
					.setSystemPasscode(properties.getPassword());
		} else {
			config.enableSimpleBroker(prefix);
		}
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint(api + endpointToConnect);
	}

}
