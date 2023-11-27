package org.demo.service;

import lombok.RequiredArgsConstructor;
import org.demo.dto.SocketNotificationErrorDTO;
import org.demo.dto.enums.SocketNotificationErrorType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.MailParseException;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailSendingServiceImpl implements MailSenderService {


	private final JavaMailSender javaMailSender;

	private final NotificationService notificationService;

	@Value("${spring.mail.username}")
	private String mailFrom;

	@Value("${spring.websocket.topic}")
	private String topic;

	@Override
	@Async
	public void send(String mailTo, String subject, String message) {
		SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
		simpleMailMessage.setFrom(mailFrom);
		simpleMailMessage.setText(message);
		simpleMailMessage.setTo(mailTo);
		simpleMailMessage.setSubject(subject);

		try {
			javaMailSender.send(simpleMailMessage);
			notificationService.sendSuccessfulNotification(topic, "Email sent to ",
					mailTo.substring(mailTo.indexOf("@") + 1)
			);
		} catch (MailParseException | MailPreparationException e) {
			notificationService.sendErrorNotification(topic, "Email not sent",
					new SocketNotificationErrorDTO(SocketNotificationErrorType.BusinessError, e.getMessage())
			);
		} catch (MailException e) {
			notificationService.sendErrorNotification(topic, "Email not sent",
					new SocketNotificationErrorDTO(SocketNotificationErrorType.SystemError, e.getMessage())
			);
		}
	}

}