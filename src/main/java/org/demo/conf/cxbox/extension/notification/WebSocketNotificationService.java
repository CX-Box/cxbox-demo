package org.demo.conf.cxbox.extension.notification;

import org.demo.dto.SocketNotificationDTO;
import org.demo.entity.core.User;

public interface WebSocketNotificationService {

	void send(SocketNotificationDTO socketNotificationDTO, User currentUser);

}
