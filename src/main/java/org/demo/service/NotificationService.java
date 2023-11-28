package org.demo.service;

import java.util.List;
import org.cxbox.model.core.entity.User;
import org.demo.dto.NotificationDTO;
import org.demo.dto.SocketNotificationDTO;
import org.demo.entity.Notification;


public interface NotificationService {

	Notification sendAndSave(SocketNotificationDTO notification, User notificationOwner);

	List<NotificationDTO> getNotifications(Integer page, Integer limit);

	Long getNotificationCount();

	void markAsRead(List<Long> notificationId);

	void delete(List<Long> ids);

}
