package org.demo.conf.cxbox.extension.notification.internal;

import java.util.List;
import org.demo.conf.cxbox.extension.notification.NotificationTemplate;


public interface NotificationService extends NotificationTemplate {

	Long getNotificationCount();

	Long checkNewNotifications(Boolean mark);

	List<NotificationDTO> getNotifications(Integer page, Integer limit);

	void markAsRead(List<Long> ids);

	void delete(List<Long> ids);

}
