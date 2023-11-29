package org.demo.service;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailSendingService {

	private final Optional<JavaMailSender> javaMailSender;

	private final Optional<MailProperties> mailProperties;

	@Async
	public void send(Optional<String> mailTo, String subject, String message) {
		if (mailTo.isPresent() && mailSenderEnabled()) {
			SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
			simpleMailMessage.setFrom(mailProperties.get().getUsername());
			simpleMailMessage.setText(message);
			simpleMailMessage.setTo(mailTo.get());
			simpleMailMessage.setSubject(subject);
			javaMailSender.get().send(simpleMailMessage);
		}
	}

	private boolean mailSenderEnabled() {
		return javaMailSender.isPresent()
				&& mailProperties.isPresent()
				&& mailProperties.get().getHost() != null
				&& !mailProperties.get().getHost().isBlank();
	}

}
