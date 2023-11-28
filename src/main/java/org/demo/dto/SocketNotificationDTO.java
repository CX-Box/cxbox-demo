package org.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
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
	 * Link in the notification
	 */
	private String drillDownLink;

	/**
	 * Details of the link type, configures the link click
	 */
	private String drillDownType;

	/**
	 * Link display name
	 */
	private String drillDownLabel;

	private Integer page;

	private Integer limit;

}
