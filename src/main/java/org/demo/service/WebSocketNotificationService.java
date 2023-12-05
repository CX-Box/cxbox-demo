package org.demo.service;

import org.cxbox.model.core.entity.User;
import org.demo.dto.SocketNotificationDTO;

public interface WebSocketNotificationService {

	void send(SocketNotificationDTO socketNotificationDTO, User currentUser);

}
