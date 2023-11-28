package org.demo.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.util.session.SessionService;
import org.cxbox.model.core.entity.User;
import org.demo.dto.NotificationDTO;
import org.demo.dto.SocketNotificationDTO;
import org.demo.entity.Notification;
import org.demo.repository.NotificationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

	private final NotificationRepository notificationRepository;

	private final SessionService sessionService;

	private final WebSocketNotificationService webSocketNotificationService;

	@Override
	public Notification sendAndSave(SocketNotificationDTO socketNotificationDTO, User notificationOwner) {

		webSocketNotificationService.send(socketNotificationDTO);

		Notification notification = notificationRepository.save(Notification.builder()
				.user(notificationOwner)
				.text(socketNotificationDTO.getText())
				.isRead(false)
				.createTime(socketNotificationDTO.getTime())
				.build());

		return notification;
	}

	@Override
	public List<NotificationDTO> getNotifications(Integer page, Integer limit) {
		return notificationRepository.findAllByUser(
						sessionService.getSessionUser(),
						PageRequest.of(page, limit)
				)
				.map(NotificationDTO::new)
				.toList();
	}

	@Override
	public Long getNotificationCount() {
		return notificationRepository.countByUser(sessionService.getSessionUser());
	}

	@Override
	@Transactional
	public void markAsRead(List<Long> ids) {
		notificationRepository.markAsRead(ids);
	}

	@Override
	@Transactional
	public void delete(List<Long> ids) {
		notificationRepository.deleteAllById(ids);
	}

}
