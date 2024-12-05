package org.demo.conf.cxbox.extension.notification;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
public final class NotificationError extends AbstractNotification {

	private Type errorType;

	@JsonFormat(shape = Shape.NUMBER)
	public enum Type {
		BUSINESS_ERROR,
		SYSTEM_ERROR;
	}

}
