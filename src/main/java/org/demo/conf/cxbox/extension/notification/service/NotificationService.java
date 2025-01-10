package org.demo.conf.cxbox.extension.notification.service;

import java.util.List;
import org.demo.conf.cxbox.extension.notification.NotificationTemplate;
import org.demo.conf.cxbox.extension.notification.dto.NotificationDTO;


public interface NotificationService extends NotificationTemplate {

	Long getNotificationCount();

	Long checkNewNotifications(Boolean mark);

	List<NotificationDTO> getNotifications(Integer page, Integer limit);

	void markAsRead(List<Long> ids);

	void delete(List<Long> ids);

}
