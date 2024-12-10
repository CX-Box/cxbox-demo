package org.demo.conf.cxbox.extension.siem;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Nullable;

import java.util.Optional;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.data.ResultPage;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.crudma.CrudmaEvent;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.util.session.SessionService;
import org.springframework.context.ApplicationListener;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Component
@RequiredArgsConstructor
public class SiemEventListener implements ApplicationListener<CrudmaEvent<?>> {

	private static final String IP_REGEX = "^((0|1\\d?\\d?|2[0-4]?\\d?|25[0-5]?|[3-9]\\d?)\\.){3}(0|1\\d?\\d?|2[0-4]?\\d?|25[0-5]?|[3-9]\\d?)$";

	private final SessionService sessionService;

	private final SecurityLogger logger;

	private final ObjectMapper cxboxObjectMapper;

	@Override
	@SneakyThrows
	public void onApplicationEvent(@NonNull CrudmaEvent event) {
		var result = getResult(event);
		if (result == null) {
			return;
		}
		logger.logSecurityEvent(
				event.getCrudmaAction().getActionType().name(),
				event.getCrudmaAction().getBc(),
				SecurityContextHolder.getContext().getAuthentication().getName(),
				String.join(",", sessionService.getSessionUserRoles()),
				sessionService.getSessionId(),
				getUserIp(),
				cxboxObjectMapper.writeValueAsString(result)
		);
	}

	@Nullable
	private String getUserIp() {
		if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
			var rq = attributes.getRequest();
			return Optional.ofNullable(rq.getHeader("X-Forwarded-For"))
					.filter(ip -> !ip.isBlank() && ip.matches(IP_REGEX))
					.orElse(rq.getRemoteAddr());
		}
		return null;
	}


	@Nullable
	private Object getResult(@NonNull CrudmaEvent<?> event) {
		var result = event.getResult();
		if (result instanceof ResultPage<?> resultPage) {
			return resultPage.getResult();
		}
		if (result instanceof ActionResultDTO<?> actionResultDto) {
			return actionResultDto.getRecord();
		}
		if (result instanceof DataResponseDTO) {
			return result;
		}
		return null;
	}

}
