package org.demo.conf.cxbox.extension.notification;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.demo.conf.cxbox.extension.notification.enums.SocketNotificationErrorType;

@Getter
@Setter
@AllArgsConstructor
public class SocketNotificationErrorDTO {

	private SocketNotificationErrorType socketNotificationErrorDTO;

	private String message;
}
