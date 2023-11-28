package org.demo.service;

import org.demo.dto.SocketNotificationDTO;

public interface WebSocketNotificationService {

	void send(SocketNotificationDTO socketNotificationDTO);

}
