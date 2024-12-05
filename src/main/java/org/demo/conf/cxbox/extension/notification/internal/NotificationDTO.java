package org.demo.conf.cxbox.extension.notification.internal;

import java.time.ZonedDateTime;
import java.util.List;
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

	private List<NotificationLink> links;

}
