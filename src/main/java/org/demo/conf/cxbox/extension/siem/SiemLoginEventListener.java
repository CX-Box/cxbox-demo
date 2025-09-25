package org.demo.conf.cxbox.extension.siem;

import static org.demo.conf.cxbox.extension.siem.SecurityLogger.writeErrorAsString;
import static org.demo.conf.cxbox.extension.siem.SecurityLogger.getUserIp;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.core.util.session.SessionService;
import org.demo.conf.cxbox.customization.role.LoginEvent;
import org.springframework.boot.logging.LogLevel;
import org.springframework.context.ApplicationListener;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SiemLoginEventListener implements ApplicationListener<LoginEvent<?>> {

	private final SessionService sessionService;

	private final SecurityLogger logger;

	private final ObjectMapper cxboxObjectMapper;


	@Override
	@SneakyThrows
	public void onApplicationEvent(@NonNull LoginEvent<?> event) {
		LogLevel level = event.getException() != null
				? logger.getLevelLogException(event.getException())
				: LogLevel.INFO;
		logger.logSecurityEvent(
				level,
				"login",
				"/login",
				SecurityContextHolder.getContext().getAuthentication().getName(),
				String.join(",", sessionService.getSessionUserRoles()),
				sessionService.getSessionId(),
				getUserIp(),
				LogLevel.ERROR.equals(level) ? writeErrorAsString(event.getException())
						: cxboxObjectMapper.writeValueAsString(event.getResult().getUserId())
		);
	}

}
