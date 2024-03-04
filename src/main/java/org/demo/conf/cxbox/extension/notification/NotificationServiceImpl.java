package org.demo.conf.cxbox.extension.notification;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.util.session.SessionService;
import org.demo.entity.core.User;
import org.demo.dto.NotificationDTO;
import org.demo.dto.SocketNotificationDTO;
import org.demo.entity.Notification;
import org.demo.repository.NotificationRepository;
import org.demo.repository.core.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

	private final NotificationRepository notificationRepository;

	private final SessionService sessionService;

	private final WebSocketNotificationService webSocketNotificationService;

	private final UserRepository userRepository;

	@Override
	public Notification sendAndSave(SocketNotificationDTO socketNotificationDTO, User notificationOwner) {

		webSocketNotificationService.send(socketNotificationDTO, notificationOwner);

		Notification notification = notificationRepository.save(Notification.builder()
				.user(notificationOwner)
				.text(socketNotificationDTO.getText())
				.isRead(false)
				.createdDateUtc(LocalDateTime.now(ZoneOffset.UTC))
				.build());

		return notification;
	}

	@Override
	public List<NotificationDTO> getNotifications(Integer page, Integer limit) {
		return notificationRepository.findAllByUser(
						userRepository.getReferenceById(sessionService.getSessionUser().getId()),
						PageRequest.of(page, limit)
				)
				.map(NotificationDTO::new)
				.toList();
	}

	@Override
	public Long getNotificationCount() {
		return notificationRepository.countByUser(userRepository.getReferenceById(sessionService.getSessionUser().getId()));
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

	@Override
	public Long getCountWithMark(Boolean mark) {
		return notificationRepository.countByUserAndIsRead(userRepository.getReferenceById(sessionService.getSessionUser().getId()), mark);
	}

}
