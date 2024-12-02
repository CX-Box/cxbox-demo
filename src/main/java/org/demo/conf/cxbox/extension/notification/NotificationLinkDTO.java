package org.demo.conf.cxbox.extension.notification;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.dto.DrillDownType;
import org.demo.entity.NotificationLink;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationLinkDTO extends DataResponseDTO {

	private String drillDownLink;

	private String drillDownLabel;

	private DrillDownType drillDownType;

	public NotificationLinkDTO(NotificationLink entity) {
		this.drillDownLink = entity.getDrillDownLink();
		this.drillDownLabel = entity.getDrillDownLabel();
		this.drillDownType = entity.getDrillDownType();
	}

}
