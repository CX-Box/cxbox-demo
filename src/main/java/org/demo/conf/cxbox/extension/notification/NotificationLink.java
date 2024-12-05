package org.demo.conf.cxbox.extension.notification;

import lombok.Getter;
import lombok.NonNull;
import org.cxbox.core.service.action.DrillDownTypeSpecifier;

@Getter
public class NotificationLink {

	private String drillDownLink;

	private String drillDownType;

	private String drillDownLabel;

	public static NotificationLink of(@NonNull String label) {
		var result = new NotificationLink();
		result.drillDownLabel = label;
		return result;
	}

	public NotificationLink setDrillDown(@NonNull DrillDownTypeSpecifier drillDownType, @NonNull String drillDown) {
		this.drillDownLink = drillDown;
		this.drillDownType = drillDownType.getValue();
		return this;
	}

}
