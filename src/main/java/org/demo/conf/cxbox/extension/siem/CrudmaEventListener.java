package org.demo.conf.cxbox.extension.siem;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.data.ResultPage;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.crudma.CrudmaActionType;
import org.cxbox.core.crudma.CrudmaEvent;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.util.session.SessionService;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

/**
 * @author Andrey B. Panfilov <andrey@panfilov.tel>
 */
@RequiredArgsConstructor
@Component
@Slf4j
public class CrudmaEventListener implements ApplicationListener<CrudmaEvent<?>> {

	private final SessionService sessionService;

	private final SecurityLogger logger;

	@Override
	public void onApplicationEvent(@NonNull CrudmaEvent event) {
		List<?> result = getResult(event);
		if (result.isEmpty()) {
			return;
		}
		SecurityStatus status = getStatus(event);
		if (status == null) {
			return;
		}
		logger.logSecurityEvent(
				status,
				event.getCrudmaAction().getBc(),
				result,
				sessionService.getSessionUser().getId().toString(),
				sessionService.getSessionId()
		);
	}

	@NonNull
	private List<?> getResult(CrudmaEvent<?> event) {
		var result = event.getResult();
		if (result instanceof ResultPage<?>) {
			return ((ResultPage<?>) result).getResult();
		}
		if (result instanceof ActionResultDTO<?>) {
			var actionResult = ((ActionResultDTO<?>) result).getRecord();
			if (actionResult != null) {
				return Collections.singletonList(actionResult);
			}
		}
		if (result instanceof DataResponseDTO) {
			return Collections.singletonList(result);
		}
		return new ArrayList<>();
	}

	private SecurityStatus getStatus(CrudmaEvent<?> event) {
		CrudmaActionType actionType = event.getCrudmaAction().getActionType();
		return switch (actionType) {
			case UPDATE -> SecurityStatus.UPDATE;
			case CREATE -> SecurityStatus.CREATE;
			case DELETE -> SecurityStatus.DELETE;
			case FIND -> {
				if (isExport(event.getCrudmaAction().getBc())) {
					yield SecurityStatus.EXPORT;
				}
				yield SecurityStatus.VIEW;
			}
			default -> null;
		};
	}

	private boolean isExport(BusinessComponent bc) {
		return bc.getParameters().getExportType() != null;
	}

}
