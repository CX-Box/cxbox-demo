package org.demo.conf.cxbox.extension.notification;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.Notification;

@Getter
@Setter
@NoArgsConstructor
public class NotificationDTO extends DataResponseDTO {

	private Boolean isRead;

	private String text;

	private ZonedDateTime createTime;

	private List<NotificationLinkDTO> links;

	public NotificationDTO(Notification entity) {
		this.id = entity.getId().toString();
		this.isRead = entity.getIsRead();
		this.text = entity.getText();
		this.createTime = ZonedDateTime.of(entity.getCreatedDateUtc(), ZoneId.of("Z"));
		this.links = entity.getLinks()
				.stream()
				.map(NotificationLinkDTO::new)
				.toList();
	}

}
