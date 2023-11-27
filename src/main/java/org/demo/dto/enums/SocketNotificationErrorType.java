package org.demo.dto.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;

@JsonFormat(shape = Shape.NATURAL)
public enum SocketNotificationErrorType {

	SystemError, BusinessError;
}
