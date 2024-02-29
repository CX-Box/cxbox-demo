package org.demo.service.core.mail;

import static org.cxbox.api.service.session.InternalAuthorizationService.VANILLA;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.service.session.InternalAuthorizationService;
import org.cxbox.core.dto.DrillDownType;
import org.demo.dto.SocketNotificationDTO;
import org.demo.dto.SocketNotificationErrorDTO;
import org.demo.dto.enums.SocketNotificationErrorType;
import org.demo.entity.core.User;
import org.demo.service.core.notification.NotificationService;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.mail.MailException;
import org.springframework.mail.MailParseException;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailSendingService {

	private final Optional<JavaMailSender> javaMailSender;

	private final Optional<MailProperties> mailProperties;

	private final NotificationService notificationService;

	private final InternalAuthorizationService authzService;

	private static final String HTTP = "http://";

	@Async
	public void send(Optional<String> mailTo, String subject, String message, User currentUser) {
		if (mailTo.isPresent() && mailSenderEnabled()) {
			try {
				SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
				simpleMailMessage.setFrom(mailProperties.get().getUsername());
				simpleMailMessage.setText(message);
				simpleMailMessage.setTo(mailTo.get());
				simpleMailMessage.setSubject(subject);

				javaMailSender.get().send(simpleMailMessage);

				authzService.loginAs(authzService.createAuthentication(VANILLA));

				String link = mailTo.map(mail -> mail.substring(mail.indexOf("@") + 1)).orElse("");

				notificationService.sendAndSave(SocketNotificationDTO.builder()
						.title("Successful")
						.text("Email sent to " + mailTo.orElse(""))
						.drillDownType(DrillDownType.EXTERNAL_NEW.getValue())
						.drillDownLabel(link)
						.drillDownLink(HTTP + link)
						.time(LocalDateTime.now(ZoneOffset.UTC))
						.build(), currentUser);

			} catch (MailParseException | MailPreparationException e) {
				notificationService.sendAndSave(
						getSocketNotificationDTOWithError(SocketNotificationErrorType.BusinessError, e.getMessage(),
								mailTo.orElse("")
						),
						currentUser
				);

			} catch (MailException e) {
				notificationService.sendAndSave(
						getSocketNotificationDTOWithError(SocketNotificationErrorType.SystemError, e.getMessage(),
								mailTo.orElse("")
						),
						currentUser
				);
			}
		}
	}

	private boolean mailSenderEnabled() {
		return javaMailSender.isPresent()
				&& mailProperties.isPresent()
				&& mailProperties.get().getHost() != null
				&& !mailProperties.get().getHost().isBlank();
	}

	private SocketNotificationDTO getSocketNotificationDTOWithError(SocketNotificationErrorType type,
			String message, String mailTo) {
		return SocketNotificationDTO.builder()
				.title("Not Successful")
				.text("Email not sent to " + mailTo)
				.time(LocalDateTime.now(ZoneOffset.UTC))
				.error(new SocketNotificationErrorDTO(type, message))
				.build();
	}

}
