package org.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.demo.dto.SocketNotificationDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketNotificationServiceImpl implements WebSocketNotificationService {

	private final SimpMessagingTemplate simpMessagingTemplate;

	private final ObjectMapper objectMapper;


	@Value("${spring.websocket.topic}")
	private final String topic;

	@Override
	@SneakyThrows
	public void send(SocketNotificationDTO socketNotificationDTO) {

		simpMessagingTemplate.convertAndSend(
				topic,
				objectMapper.writeValueAsString(socketNotificationDTO)
		);
	}

}
