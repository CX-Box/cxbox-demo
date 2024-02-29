package org.demo.service.core.notification;

import java.util.List;
import org.demo.dto.NotificationDTO;
import org.demo.dto.SocketNotificationDTO;
import org.demo.entity.Notification;
import org.demo.entity.core.User;


public interface NotificationService {

	Notification sendAndSave(SocketNotificationDTO notification, User notificationOwner);

	List<NotificationDTO> getNotifications(Integer page, Integer limit);

	Long getNotificationCount();

	void markAsRead(List<Long> notificationId);

	void delete(List<Long> ids);

	Long getCountWithMark(Boolean mark);
}
