package org.demo.conf.cxbox.extension.siem;

import jakarta.annotation.Nullable;
import java.util.Optional;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Service
public class SecurityLogger {

	private static final String IP_REGEX = "^((0|1\\d?\\d?|2[0-4]?\\d?|25[0-5]?|[3-9]\\d?)\\.){3}(0|1\\d?\\d?|2[0-4]?\\d?|25[0-5]?|[3-9]\\d?)$";

	@Nullable
	public static String getUserIp() {
		if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
			var rq = attributes.getRequest();
			return Optional.ofNullable(rq.getHeader("X-Forwarded-For"))
					.filter(ip -> !ip.isBlank() && ip.matches(IP_REGEX))
					.orElse(rq.getRemoteAddr());
		}
		return null;
	}

	public static String writeErrorAsString(@NonNull Throwable e) {
		return e.getMessage();
	}

	public void logSecurityEvent(@NonNull SecurityLogLevel level,
			@NonNull String operation,
			String endpoint,
			String userIdentifier,
			String userRole,
			String sessionIdentifier,
			String ipAddress,
			String data) {
		String msg = "SIEM event. " +
				"Operation: " + operation +
				", endpoint (resource): " + endpoint +
				", user: " + userIdentifier + " (" + userRole + ")" +
				", session: " + sessionIdentifier +
				", ipAddress: " + ipAddress +
				", data: " + data;
		switch (level) {
			case ERROR -> log.error(msg);
			case WARN -> log.warn(msg);
			default -> log.info(msg);
		}
	}

	public enum SecurityLogLevel {
		INFO,
		WARN,
		ERROR
	}

}
