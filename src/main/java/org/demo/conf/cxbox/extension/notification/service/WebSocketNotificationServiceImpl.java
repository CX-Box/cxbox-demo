package org.demo.conf.cxbox.extension.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.cxbox.api.service.session.IUser;
import org.demo.conf.cxbox.extension.notification.AbstractNotification;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketNotificationServiceImpl implements WebSocketNotificationService {

	private final SimpMessagingTemplate simpMessagingTemplate;

	private final ObjectMapper objectMapper;

	@Value("${spring.websocket.prefix}")
	private String prefix;

	@Value("${spring.websocket.urlPath}")
	private String urlPath;

	@Override
	@SneakyThrows
	public <T extends AbstractNotification> void send(T message, IUser<Long> user) {
		simpMessagingTemplate.convertAndSend(
				prefix + "/" + user.getId() + urlPath,
				objectMapper.writeValueAsString(message)
		);
	}

}
