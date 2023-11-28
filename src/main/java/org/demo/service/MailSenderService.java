package org.demo.service;

import org.cxbox.model.core.entity.User;

public interface MailSenderService {

	void send(String mailTo, String tittle, String message, User notificationOwner);

}