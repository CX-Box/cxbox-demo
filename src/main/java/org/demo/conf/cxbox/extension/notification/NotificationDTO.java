package org.demo.conf.cxbox.extension.notification;

import java.time.ZonedDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class NotificationDTO {

	private Long id;

	private Boolean isRead;

	private String text;

	private ZonedDateTime createTime;

	private List<NotificationLinkDTO> links;


}
