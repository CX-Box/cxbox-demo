package org.demo.conf.websocket;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.service.session.IUser;
import org.cxbox.core.util.session.SessionService;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * see <a href="https://docs.spring.io/spring-framework/reference/web/websocket/stomp/authentication-token-based.html">spring websocket</a>
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	private final ActiveMQConfigurationsProperties properties;

	private final SessionService sessionService;

	@Value("${spring.websocket.prefix}")
	private String prefix;

	@Value("${app.stomp.broker-type}")
	private String brokerType;

	@Value("${spring.websocket.endpointToConnect}")
	private String endpointToConnect;

	@Value("${cxbox.api.path}")
	private String api;

	@Value("${app.stomp.stomp-post}")
	private Integer stompPort;

	@Value("${spring.websocket.urlPath}")
	private String urlPath;

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		if ("activemq".equalsIgnoreCase(brokerType)) {
			config.enableStompBrokerRelay(prefix)
					.setRelayHost(properties.getHost())
					.setClientLogin(properties.getUser())
					.setRelayPort(stompPort)
					.setClientPasscode(properties.getPassword())
					.setSystemLogin(properties.getUser())
					.setSystemPasscode(properties.getPassword());
		} else {
			config.enableSimpleBroker(prefix);
		}
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint(api + endpointToConnect)
				.setAllowedOriginPatterns("*");
	}

	@Override
	public void configureClientInboundChannel(ChannelRegistration registration) {
		registration.interceptors(new ChannelInterceptor() {
			@Override
			@SneakyThrows
			public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
				StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(message);
				if (StompCommand.SEND.equals(headerAccessor.getCommand())) {
					throw new AccessDeniedException("user cannot send messages. only notifications subscription is supported");
				}
				if (StompCommand.SUBSCRIBE.equals(headerAccessor.getCommand())) {
					SecurityContextHolder.getContext().setAuthentication((Authentication) headerAccessor.getUser());
					var destination = headerAccessor.getDestination();
					var allowedDestination = getUserNotificationsDestination(prefix, urlPath, sessionService.getSessionUser());
					if (destination == null || !destination.equals(allowedDestination)) {
						throw new AccessDeniedException("user can only subscribe to /user/${userId}/queue/websocket.reply topic");
					}
				}
				return message;
			}
		});
	}

	@NotNull
	public static String getUserNotificationsDestination(String prefix, String urlPath, IUser<Long> currentUser) {
		return prefix + "/" + currentUser.getId() + urlPath;
	}
}
