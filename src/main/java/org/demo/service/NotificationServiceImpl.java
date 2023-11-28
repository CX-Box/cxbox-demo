package org.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.cxbox.core.dto.DrillDownType;
import org.demo.dto.SocketNotificationDTO;
import org.demo.dto.SocketNotificationErrorDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

	private final SimpMessagingTemplate simpMessagingTemplate;

	private final ObjectMapper objectMapper;

	@Override
	@SneakyThrows
	public void sendSuccessfulNotification(String destination, String text, String link) {

		simpMessagingTemplate.convertAndSend(
				destination,
				objectMapper.writeValueAsString(SocketNotificationDTO.builder()
						.title("Successfully")
						.time(LocalDateTime.now())
						.drillDownLink(link)
						.drillDownLabel(link)
						.drillDownType(DrillDownType.EXTERNAL_NEW.getValue())
						.text(text)
						.build())
		);
	}

	@Override
	@SneakyThrows
	public void sendErrorNotification(String destination, String text, SocketNotificationErrorDTO error) {
		simpMessagingTemplate.convertAndSend(
				destination,
				objectMapper.writeValueAsString(SocketNotificationDTO.builder()
						.title("Not Successful")
						.error(error)
						.time(LocalDateTime.now())
						.text(text)
						.build())
		);
	}

}
