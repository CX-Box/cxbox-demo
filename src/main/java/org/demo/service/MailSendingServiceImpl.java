package org.demo.service;

import static org.cxbox.api.service.session.InternalAuthorizationService.VANILLA;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.service.session.InternalAuthorizationService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.model.core.entity.User;
import org.demo.dto.SocketNotificationDTO;
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

	private final InternalAuthorizationService authzService;


	@Value("${spring.mail.username}")
	private String mailFrom;

	private static final String HTTP = "http://";

	@Override
	@Async
	public void send(String mailTo, String subject, String message, User notificationOwner) {
		authzService.loginAs(authzService.createAuthentication(VANILLA));

		SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
		simpleMailMessage.setFrom(mailFrom);
		simpleMailMessage.setText(message);
		simpleMailMessage.setTo(mailTo);
		simpleMailMessage.setSubject(subject);

		try {

			javaMailSender.send(simpleMailMessage);
			notificationService.sendAndSave(SocketNotificationDTO.builder()
					.title("Successful")
					.text("Email sent to " + mailTo)
					.drillDownType(DrillDownType.EXTERNAL_NEW.getValue())
					.drillDownLabel(mailTo.substring(mailTo.indexOf("@") + 1))
					.drillDownLink(HTTP + mailTo.substring(mailTo.indexOf("@") + 1))
					.time(LocalDateTime.now())
					.build(), notificationOwner);

		} catch (MailParseException | MailPreparationException e) {
			notificationService.sendAndSave(
					getSocketNotificationDTOWithError(SocketNotificationErrorType.BusinessError, e.getMessage(), mailTo),
					notificationOwner
			);

		} catch (MailException e) {
			notificationService.sendAndSave(
					getSocketNotificationDTOWithError(SocketNotificationErrorType.SystemError, e.getMessage(), mailTo),
					notificationOwner
			);

		}
	}

	private SocketNotificationDTO getSocketNotificationDTOWithError(SocketNotificationErrorType type,
			String message, String mailTo) {
		return SocketNotificationDTO.builder()
				.title("Not Successful")
				.text("Email not sent to " + mailTo)
				.time(LocalDateTime.now())
				.error(new SocketNotificationErrorDTO(type, message))
				.build();
	}

}