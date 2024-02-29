package org.demo.service.core.notification;

import org.demo.dto.SocketNotificationDTO;
import org.demo.entity.core.User;

public interface WebSocketNotificationService {

	void send(SocketNotificationDTO socketNotificationDTO, User currentUser);

}
