package org.demo.conf.cxbox.extension.notification;

import java.time.ZonedDateTime;
import java.util.List;
import lombok.Getter;
import lombok.experimental.SuperBuilder;
import org.cxbox.api.data.dto.rowmeta.Icon;

@Getter
@SuperBuilder
public final class Notification extends AbstractNotification {

	/**
	 * Notification title
	 */
	private String title;

	/**
	 * Notification creation time
	 */
	private ZonedDateTime time;

	/**
	 * The list of links in the notification
	 */
	private List<NotificationLink> links;

	/**
	 * Notification icon
	 */
	private Icon icon;

	/**
	 * Strange param... page to fetch on UI in notifications bell after this notification
	 */
	private Integer page;

	private Integer limit;

}
