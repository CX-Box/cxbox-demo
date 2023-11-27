package org.demo.service;

import org.demo.dto.SocketNotificationErrorDTO;

public interface NotificationService {

	void sendSuccessfulNotification(String destination, String text,  String link);

	void sendErrorNotification(String destination, String text, SocketNotificationErrorDTO error);

}
