package org.demo.conf.cxbox.extension.notification;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SocketNotificationDTO {

	/**
	 * The error object, if present, contains the type and message
	 */
	@JsonProperty("errorType")
	private SocketNotificationErrorDTO error;

	/**
	 * Notification title
	 */
	private String title;

	/**
	 * Notification creation time
	 */
	private LocalDateTime time;

	/**
	 * Notification text
	 */
	private String text;

	/**
	 * Notification icon
	 */
	private String icon;

	/**
	 * Notification icon color
	 */
	private String iconColor;

	/**
	 * The list of links in the notification
	 */
	private List<NotificationLinkDTO> links;

	private Integer page;

	private Integer limit;

}
