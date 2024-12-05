package org.demo.conf.cxbox.extension.notification;

import org.cxbox.api.service.session.IUser;

public interface NotificationTemplate {

	/**
	 * Use this method to send notifications to user from business logic
	 * @param message notification
	 * @param user sendTo
	 */
	<T extends AbstractNotification> void saveAndSend(T message, IUser<Long> user);

}
