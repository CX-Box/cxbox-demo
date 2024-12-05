package org.demo.conf.cxbox.extension.notification;

import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder()
public sealed class AbstractNotification permits NotificationError, Notification {

	/**
	 * Notification text
	 */
	private String text;

}
