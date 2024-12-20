package org.demo.conf.cxbox.extension.notification.service;

import static java.time.ZoneOffset.UTC;
import static java.util.Optional.ofNullable;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.service.session.IUser;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.util.session.SessionService;
import org.demo.conf.cxbox.extension.notification.AbstractNotification;
import org.demo.conf.cxbox.extension.notification.Notification;
import org.demo.conf.cxbox.extension.notification.NotificationLink;
import org.demo.conf.cxbox.extension.notification.dto.NotificationDTO;
import org.demo.conf.cxbox.extension.notification.entity.NotificationEntity;
import org.demo.conf.cxbox.extension.notification.entity.NotificationLinkEntity;
import org.demo.repository.core.notification.NotificationRepository;
import org.demo.repository.core.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

	private final NotificationRepository notificationRepository;

	private final SessionService sessionService;

	private final WebSocketNotificationService webSocketNotificationService;

	private final UserRepository userRepository;

	@Override
	public Long getNotificationCount() {
		return notificationRepository.countByUser(userRepository.getReferenceById(sessionService.getSessionUser().getId()));
	}

	@Override
	public Long checkNewNotifications(Boolean mark) {
		return notificationRepository.countByUserAndIsRead(userRepository.getReferenceById(sessionService.getSessionUser()
				.getId()), mark);
	}

	@Override
	public List<NotificationDTO> getNotifications(Integer page, Integer limit) {
		return notificationRepository.findAllByUser(
						userRepository.getReferenceById(sessionService.getSessionUser().getId()),
						PageRequest.of(page, limit)
				)
				.map(this::toDto)
				.toList();
	}

	@Override
	public <T extends AbstractNotification> void saveAndSend(T message, IUser<Long> user) {
		var notification = NotificationEntity.builder()
				.user(userRepository.getReferenceById(user.getId()))
				.text(message.getText())
				.isRead(false)
				.createdDateUtc(LocalDateTime.now(UTC))
				.build();
		if (message instanceof Notification notificationMessage) {
			notification.addNotificationLinks(notificationMessage.getLinks()
					.stream()
					.map(this::linkToEntity)
					.toList());
		}
		notificationRepository.save(notification);
		notificationRepository.flush();
		webSocketNotificationService.send(message, user);
	}

	@Override
	public void markAsRead(List<Long> ids) {
		notificationRepository.markAsRead(ids);
	}

	@Override
	public void delete(List<Long> ids) {
		notificationRepository.deleteAllById(ids);
	}

	public NotificationDTO toDto(NotificationEntity entity) {
		return NotificationDTO.builder()
				.id(entity.getId())
				.isRead(entity.getIsRead())
				.text(entity.getText())
				.time(ZonedDateTime.of(entity.getCreatedDateUtc(), UTC))
				.links(entity.getLinks()
						.stream()
						.map(link -> NotificationLink
								.of(link.getDrillDownLabel())
								.setDrillDown(link.getDrillDownType(), link.getDrillDownLink()))
						.toList())
				.build();
	}

	public NotificationLinkEntity linkToEntity(NotificationLink entity) {
		return NotificationLinkEntity.builder()
				.drillDownLink(entity.getDrillDownLink())
				.drillDownType(ofNullable(entity.getDrillDownType()).map(DrillDownType::of).orElse(null))
				.drillDownLabel(entity.getDrillDownLabel())
				.build();
	}


}
