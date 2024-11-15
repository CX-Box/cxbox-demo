package org.demo.conf.cxbox.extension.notification;

import static org.demo.conf.websocket.WebSocketConfig.getUserNotificationsDestination;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.cxbox.api.service.session.IUser;
import org.demo.entity.core.User;
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
	public void send(SocketNotificationDTO socketNotificationDTO, User currentUser) {

		simpMessagingTemplate.convertAndSend(
				getUserNotificationsDestination(prefix, urlPath, new IUser<>() {
					@Override
					public Long getId() {
						return currentUser.getId();
					}

					@Override
					public Long getDepartmentId() {
						return currentUser.getDepartmentId();
					}
				}),
				objectMapper.writeValueAsString(socketNotificationDTO)
		);
	}

}
