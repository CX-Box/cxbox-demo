package org.demo.service.mail;

import static org.cxbox.api.service.session.InternalAuthorizationService.VANILLA;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.service.session.InternalAuthorizationService;
import org.cxbox.core.dto.DrillDownType;
import org.demo.conf.cxbox.extension.notification.NotificationLinkDTO;
import org.demo.conf.cxbox.extension.notification.NotificationService;
import org.demo.conf.cxbox.extension.notification.SocketNotificationDTO;
import org.demo.conf.cxbox.extension.notification.SocketNotificationErrorDTO;
import org.demo.conf.cxbox.extension.notification.enums.SocketNotificationErrorType;
import org.demo.entity.Contact;
import org.demo.entity.Meeting;
import org.demo.entity.core.User;
import org.jobrunr.jobs.annotations.Job;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.mail.MailException;
import org.springframework.mail.MailParseException;
import org.springframework.mail.MailPreparationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailSendingService {

	private final Optional<JavaMailSender> javaMailSender;

	private final Optional<MailProperties> mailProperties;

	private final NotificationService notificationService;

	private final InternalAuthorizationService authzService;

	private static final String HTTP = "http://";

	@Job(name = "The sample job with variable %0", retries = 2)
	public void stats(String variable) {
		log.info(variable);
	}

	@Async
	public void send(Optional<Meeting> meeting, String subject, String message, User currentUser) {
		Optional<String> mailTo = meeting.map(Meeting::getContact).map(Contact::getEmail);
		boolean mailSend = mailTo.isPresent() && mailSenderEnabled();

		if (mailSend) {
			try {
				SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
				simpleMailMessage.setFrom(mailProperties.get().getUsername());
				simpleMailMessage.setText(message);
				simpleMailMessage.setTo(mailTo.get());
				simpleMailMessage.setSubject(subject);

				javaMailSender.get().send(simpleMailMessage);

			} catch (MailParseException | MailPreparationException e) {
				notificationService.sendAndSave(
						getSocketNotificationDTOWithError(
								SocketNotificationErrorType.BusinessError, e.getMessage(),
								mailTo.orElse("")
						),
						currentUser
				);

			} catch (MailException e) {
				notificationService.sendAndSave(
						getSocketNotificationDTOWithError(
								SocketNotificationErrorType.SystemError, e.getMessage(),
								mailTo.orElse("")
						),
						currentUser
				);
			}
		}
		authzService.loginAs(authzService.createAuthentication(VANILLA));

		String link = mailTo.map(mail -> mail.substring(mail.indexOf("@") + 1)).orElse("");

		notificationService.sendAndSave(
				SocketNotificationDTO.builder()
						.title(mailSend ? "Successful" : "Error")
						.text(
								String.format(
										"%s from meeting №%s",
										mailSend ? "Email sent to " + mailTo.orElse("") : "Email was not sent to " + mailTo.orElse(""),
										meeting.isPresent() ? meeting.get().getId() : ""
								)
						)
						.links(getLinks(link, meeting))
						.time(LocalDateTime.now(ZoneOffset.UTC))
						.build(), currentUser
		);

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

	private List<NotificationLinkDTO> getLinks(String link, Optional<Meeting> meeting) {
		List<NotificationLinkDTO> result = new ArrayList<>();
		result.add(NotificationLinkDTO.builder()
				.drillDownType(DrillDownType.EXTERNAL_NEW.getValue())
				.drillDownLabel(link)
				.drillDownLink(HTTP + link)
				.build());

		meeting.ifPresent(value -> result.add(NotificationLinkDTO.builder()
				.drillDownType(DrillDownType.INNER.getValue())
				.drillDownLabel(String.format("Meeting %s", value.getId()))
				.drillDownLink(String.format("/screen/meeting/view/meetingview/meeting/%s", value.getId()))
				.build()));

		return result;
	}

}
