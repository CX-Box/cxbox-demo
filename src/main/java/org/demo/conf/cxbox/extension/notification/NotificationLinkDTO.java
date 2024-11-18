package org.demo.conf.cxbox.extension.notification;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.demo.entity.NotificationLink;

@Setter
@Getter
@Builder
@AllArgsConstructor
public class NotificationLinkDTO {

	@Column
	private String drillDownLink;

	@Column
	private String drillDownLabel;

	@Column
	private String drillDownType;

	public NotificationLinkDTO(NotificationLink notificationLink) {
		this.drillDownLink = notificationLink.getDrillDownLink();
		this.drillDownLabel = notificationLink.getDrillDownLabel();
		this.drillDownType = notificationLink.getDrillDownType();
	}

}
