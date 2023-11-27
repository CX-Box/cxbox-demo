package org.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.demo.dto.enums.SocketNotificationErrorType;

@Getter
@Setter
@AllArgsConstructor
public class SocketNotificationErrorDTO {

	private SocketNotificationErrorType socketNotificationErrorDTO;

	private String message;
}
