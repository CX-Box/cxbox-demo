package org.demo.conf.cxbox.extension.notification.dto;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.SuperBuilder;
import org.demo.conf.cxbox.extension.notification.NotificationLink;

@Getter
@SuperBuilder
public class NotificationDTO {

	private Long id;

	private Boolean isRead;

	private ZonedDateTime time;

	private String text;

	@Builder.Default
	private List<NotificationLink> links = new ArrayList<>();

}
