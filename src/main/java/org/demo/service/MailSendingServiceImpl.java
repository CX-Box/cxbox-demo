package org.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailSendingServiceImpl implements MailSenderService {


	private final JavaMailSender javaMailSender;

	@Value("${spring.mail.username}")
	private String mailFrom;

	@Override
	@Async
	public void send(String mailTo, String subject, String message) {
		SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
		simpleMailMessage.setFrom(mailFrom);
		simpleMailMessage.setText(message);
		simpleMailMessage.setTo(mailTo);
		simpleMailMessage.setSubject(subject);

		javaMailSender.send(simpleMailMessage);
	}

}
