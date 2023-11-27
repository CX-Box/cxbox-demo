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

	@JsonProperty("errorType")
	private SocketNotificationErrorDTO error;

	private String title;

	private LocalDateTime time;

	private String text;

	private String icon;

	private String iconColor;

	private String drillDownLink;

	private String drillDownType;

	private String drillDownLabel;

	private Integer page;

	private Integer limit;

}
