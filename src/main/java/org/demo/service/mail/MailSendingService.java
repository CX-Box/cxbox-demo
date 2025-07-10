package org.demo.service.mail;

import static org.cxbox.api.service.session.InternalAuthorizationService.VANILLA;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.service.session.IUser;
import org.cxbox.api.service.session.InternalAuthorizationService;
import org.cxbox.core.dto.DrillDownType;
import org.demo.conf.cxbox.extension.notification.Notification;
import org.demo.conf.cxbox.extension.notification.NotificationError;
import org.demo.conf.cxbox.extension.notification.NotificationError.Type;
import org.demo.conf.cxbox.extension.notification.NotificationLink;
import org.demo.conf.cxbox.extension.notification.NotificationTemplate;
import org.demo.entity.Contact;
import org.demo.entity.Meeting;
import org.demo.entity.enums.MeetingStatus;
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

	private static final String HTTP = "http://";

	private final Optional<JavaMailSender> javaMailSender;

	private final Optional<MailProperties> mailProperties;

	private final NotificationTemplate notificationTemplate;

	private final InternalAuthorizationService authzService;

	@Job(name = "The sample job with variable %0", retries = 2)
	public void stats(String variable) {
		log.info(variable);
	}

	@Async
	public void send(Optional<Meeting> meeting, String subject, String message, IUser<Long> currentUser, boolean isMass) {
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
				if (!isMass) {
					notificationTemplate.saveAndSend(
							NotificationError.builder().errorType(Type.BUSINESS_ERROR).text(e.getMessage()).build(),
							currentUser
					);
				}
			} catch (MailException e) {
				if (!isMass) {
					notificationTemplate.saveAndSend(
							NotificationError.builder().errorType(Type.SYSTEM_ERROR).text(e.getMessage()).build(),
							currentUser
					);
				}
			}
		}
		authzService.loginAs(authzService.createAuthentication(VANILLA));
		String link = mailTo.map(mail -> mail.substring(mail.indexOf("@") + 1)).orElse("");
		if (mailSend) {
			if (!isMass) {
				notificationTemplate.saveAndSend(
						Notification.builder()
								.title("Successful")
								.text(
										String.format(
												"%s from meeting №%s",
												"Email sent to " + mailTo.orElse(""),
												meeting.isPresent() ? meeting.get().getId() : ""
										)
								)
								.links(getLinks(link, meeting))
								.time(ZonedDateTime.now(ZoneOffset.UTC))
								.build(),
						currentUser
				);
			}
			meeting.get().setStatus(MeetingStatus.COMPLETED);
		} else {
			if (!isMass) {
				notificationTemplate.saveAndSend(
						NotificationError.builder().errorType(Type.BUSINESS_ERROR).text("Email was not sent").build(),
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

	@NonNull
	private List<NotificationLink> getLinks(String link, Optional<Meeting> meeting) {
		var links = new ArrayList<NotificationLink>();
		links.add(NotificationLink.of(link).setDrillDown(DrillDownType.EXTERNAL_NEW, HTTP + link));
		meeting.ifPresent(value -> links.add(
				NotificationLink.of("Meeting " + value.getId())
						.setDrillDown(DrillDownType.INNER, "/screen/meeting/view/meetingview/meeting/" + value.getId())));
		return links;
	}

}
