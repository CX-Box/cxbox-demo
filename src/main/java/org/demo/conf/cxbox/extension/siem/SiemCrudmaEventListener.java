package org.demo.conf.cxbox.extension.siem;

import static org.demo.conf.cxbox.extension.siem.SecurityLogger.getUserIp;
import static org.demo.conf.cxbox.extension.siem.SecurityLogger.writeErrorAsString;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Nullable;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.data.ResultPage;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.crudma.CrudmaActionType;
import org.cxbox.core.crudma.CrudmaEvent;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.bc.EnumBcIdentifier;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.AssociateResultDTO;
import org.cxbox.core.dto.rowmeta.MetaDTO;
import org.cxbox.core.dto.rowmeta.RowMetaDTO;
import org.cxbox.core.util.session.SessionService;
import org.demo.controller.CxboxRestController;
import org.springframework.boot.logging.LogLevel;
import org.springframework.context.ApplicationListener;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SiemCrudmaEventListener implements ApplicationListener<CrudmaEvent<?>> {

	/**
	 * Flag to determine whether to log only data IDs.
	 */
	public static final boolean SIEM_CONFIG_LOG_DATA_ID_ONLY = false;

	/**
	 * Configuration map defining which CRUD-MA actions should be logged.
	 */
	public static final Map<CrudmaActionType, Boolean> SIEM_CONFIG_LOG_CRUDMA_ACTION_TYPES = Map.of(
			CrudmaActionType.INVOKE, true,
			CrudmaActionType.FIND, true,
			CrudmaActionType.GET, true,
			CrudmaActionType.UPDATE, true,
			CrudmaActionType.PREVIEW, false,
			CrudmaActionType.DELETE, true,
			CrudmaActionType.COUNT, false,
			CrudmaActionType.ASSOCIATE, true,
			CrudmaActionType.META, false,
			CrudmaActionType.CREATE, true
	);

	/**
	 * Configuration defining which 'business component' + 'CRUD-MA action type' pairs should be logged with WARN level. INFO level is default
	 */
	public static final Map<EnumBcIdentifier, List<CrudmaActionType>> SIEM_CONFIG_LOG_LEVEL_WARN = Map.of(
			CxboxRestController.responsibilities,
			Arrays.stream(CrudmaActionType.values()).filter(e -> !e.isReadOnly()).toList(),
			CxboxRestController.responsibilitiesAction,
			Arrays.stream(CrudmaActionType.values()).filter(e -> !e.isReadOnly()).toList()
	);

	private final SessionService sessionService;

	private final SecurityLogger logger;

	private final ObjectMapper cxboxObjectMapper;


	@Override
	@SneakyThrows
	public void onApplicationEvent(@NonNull CrudmaEvent<?> event) {
		CrudmaActionType crudmaActionType = event.getCrudmaAction().getActionType();
		if (!Boolean.TRUE.equals(SIEM_CONFIG_LOG_CRUDMA_ACTION_TYPES.getOrDefault(crudmaActionType, false))) {
			return;
		}
		String customAction = getCustomAction(event, crudmaActionType);
		BusinessComponent bc = event.getCrudmaAction().getBc();

		LogLevel level = event.getException() != null
				? logger.getLevelLogException(event.getException())
				: getLevel(bc, crudmaActionType);
		logger.logSecurityEvent(
				level,
				crudmaActionType.name() + Optional.ofNullable(customAction).map(e -> "." + e).orElse(""),
				bc.getName() + (bc.getId() == null ? "" : " (" + bc.getId() + ")"),
				SecurityContextHolder.getContext().getAuthentication().getName(),
				String.join(",", sessionService.getSessionUserRoles()),
				sessionService.getSessionId(),
				getUserIp(),
				LogLevel.ERROR.equals(level) ? writeErrorAsString(event.getException())
						: cxboxObjectMapper.writeValueAsString(getData(event))
		);
	}


	@NonNull
	private LogLevel getLevel(@NonNull BusinessComponent bc, CrudmaActionType crudmaActionType) {
		return SIEM_CONFIG_LOG_LEVEL_WARN.entrySet().stream()
				.anyMatch(entry -> entry.getKey().isBc(bc) && (entry.getValue().contains(crudmaActionType)))
				? LogLevel.WARN
				: LogLevel.INFO;
	}

	@Nullable
	private String getCustomAction(@NonNull CrudmaEvent<?> event, CrudmaActionType crudmaActionType) {
		String customAction = null;
		if (crudmaActionType.equals(CrudmaActionType.INVOKE)) {
			customAction = event.getCrudmaAction().getName();
		}
		return customAction;
	}

	@Nullable
	private Object getData(@NonNull CrudmaEvent<?> event) {
		return SIEM_CONFIG_LOG_DATA_ID_ONLY ? getIds(event) : getFullData(event);
	}

	/**
	 * see all possible results in <code>{@link org.cxbox.core.crudma.CrudmaGateway}</code>
	 */
	@Nullable
	private Object getIds(@NonNull CrudmaEvent<?> event) {
		var result = event.getResult();
		if (result instanceof ResultPage<?> resultPage) {
			if (resultPage.getResult() == null) {
				return null;
			}
			return resultPage.getResult().stream()
					.filter(DataResponseDTO.class::isInstance)
					.map(DataResponseDTO.class::cast)
					.map(DataResponseDTO::getId)
					.toList();
		}
		if (result instanceof ActionResultDTO<?> actionResultDto) {
			return Optional.ofNullable(actionResultDto.getRecord()).map(DataResponseDTO::getId).orElse(null);
		}
		if (result instanceof DataResponseDTO dataResponseDTO) {
			return dataResponseDTO.getId();
		}
		if (result instanceof MetaDTO metaDTO) {
			return Optional.ofNullable(metaDTO.getRow()).map(RowMetaDTO::getFields).map(f -> f.get("id")).orElse(null);
		}
		if (result instanceof AssociateResultDTO associateResultDTO) {
			return Optional.ofNullable(associateResultDTO.getRecords())
					.map(e -> e.stream().map(DataResponseDTO::getId).toList()).orElse(null);
		}
		if (result instanceof Long count) {
			return null;
		}
		return null;
	}

	/**
	 * see all possible results in <code>{@link org.cxbox.core.crudma.CrudmaGateway}</code>
	 */
	@Nullable
	private Object getFullData(@NonNull CrudmaEvent<?> event) {
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
		if (result instanceof MetaDTO metaDTO) {
			return metaDTO.getRow();
		}
		if (result instanceof AssociateResultDTO associateResultDTO) {
			return associateResultDTO.getRecords();
		}
		if (result instanceof Long count) {
			return count;
		}
		return result;
	}

}
