package org.demo.conf.cxbox.customization.meta;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.service.session.InternalAuthorizationService;
import org.cxbox.api.service.tx.TransactionService;
import org.cxbox.dictionary.DictionaryProvider;
import org.cxbox.meta.data.ScreenDTO;
import org.cxbox.meta.data.ViewDTO;
import org.cxbox.meta.entity.Responsibilities;
import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.cxbox.meta.metahotreload.conf.properties.MetaConfigurationProperties;
import org.cxbox.meta.metahotreload.dto.ScreenSourceDto;
import org.cxbox.meta.metahotreload.dto.ViewSourceDTO;
import org.cxbox.meta.metahotreload.dto.WidgetSourceDTO;
import org.cxbox.meta.metahotreload.repository.MetaRepository;
import org.cxbox.meta.metahotreload.service.MetaHotReloadServiceImpl;
import org.cxbox.meta.metahotreload.service.MetaResourceReaderService;
import org.demo.entity.core.RoleAction;
import org.demo.entity.dictionary.InternalRole;
import org.demo.repository.core.RoleActionRepository;
import org.springframework.beans.factory.annotation.Autowired;

@Slf4j
public class MetaHotReloadServiceImpl2 extends MetaHotReloadServiceImpl {

	protected final MetaConfigurationProperties config;

	protected final MetaResourceReaderService metaResourceReaderService;

	protected final InternalAuthorizationService authzService;

	protected final TransactionService txService;

	protected final MetaRepository metaRepository;

	private final ObjectMapper objectMapper;

	private final RoleActionRepository roleActionRepository;

	private final DictionaryProvider dictionaryProvider;

	@Autowired
	private MetaConfigurationProperties metaConfigurationProperties;

	public MetaHotReloadServiceImpl2(MetaConfigurationProperties config,
			MetaResourceReaderService metaResourceReaderService,
			InternalAuthorizationService authzService,
			TransactionService txService,
			MetaRepository metaRepository, ObjectMapper objectMapper, RoleActionRepository roleActionRepository,
			DictionaryProvider dictionaryProvider) {
		super(config, metaResourceReaderService, authzService, txService, metaRepository);
		this.config = config;
		this.metaResourceReaderService = metaResourceReaderService;
		this.authzService = authzService;
		this.txService = txService;
		this.metaRepository = metaRepository;
		this.objectMapper = objectMapper;
		this.roleActionRepository = roleActionRepository;
		this.dictionaryProvider = dictionaryProvider;
	}

	public void loadMeta() {
		List<ScreenSourceDto> screenDtos = metaResourceReaderService.getScreens();
		List<ViewSourceDTO> viewDtos = metaResourceReaderService.getViews();

		List<WidgetSourceDTO> widgets = metaResourceReaderService.getWidgets();
		var list = widgets.stream().collect(Collectors.toMap(w -> w, w -> getValueOrNull(w.getOptions())));

		var widgetsToInclude = list.entrySet().stream()
				.collect(Collectors.toMap(
						Entry::getKey,
						entry -> Optional.ofNullable(readValue(entry.getValue(), Options.class))
								.map(e -> e.actionGroups)
								.map(e -> e.include)
								.map(inc -> inc.stream()
										.map(actionOrGroup -> {
											if (actionOrGroup instanceof String str) {
												return str;
											} else {
												log.warn("actionOrGroup.include [String, String, ..] format supported only, so entry "
														+ getValueOrNull(actionOrGroup) + " will be ignored");
												return null;
											}
										})
										.filter(Objects::nonNull)
										.toList()
								)
								.orElse(new ArrayList<>())
				));

		authzService.loginAs(authzService.createAuthentication(InternalAuthorizationService.VANILLA));
		if (metaConfigurationProperties.isWidgetActionGroupsEnabled()) {
			txService.invokeInTx(() -> {
				roleActionRepository.flush();
				roleActionRepository.deleteAllInBatch();
				List<RoleAction> roleActions = new ArrayList<>();

				if (metaConfigurationProperties.isWidgetActionGroupsCompact()) {
					widgetsToInclude.forEach((widget, actionList) -> {
						actionList.forEach(action -> {
							roleActions.add(new RoleAction()
									.setInternalRoleCD(RoleAction.ANY_INTERNAL_ROLE_CD)
									//.setBc(widget.getBc())
									.setAction(action)
									.setView(RoleAction.ANY_VIEW)
									.setWidget(widget.getName())
							);
						});
					});
				} else {
					widgetsToInclude.forEach((widget, actionList) -> {
						actionList.forEach(action -> {
							viewDtos.stream()
									.filter(view -> view.getWidgets().stream()
											.anyMatch(vw -> Objects.equals(vw.getWidgetName(), widget.getName())))
									.forEach(view -> {
										dictionaryProvider.getAll(InternalRole.class).forEach(role -> {
											roleActions.add(new RoleAction()
													.setInternalRoleCD(role.key())
													//.setBc(widget.getBc())
													.setAction(action)
													.setView(view.getName())
													.setWidget(widget.getName())
											);
										});
									});
						});
					});
				}

				roleActionRepository.saveAll(roleActions);
				roleActionRepository.flush();
				return null;
			});
			log.info(widgetsToInclude.toString());
		}
		txService.invokeInTx(() -> {
			metaRepository.deleteAllMeta();
			responsibilitiesProcess(screenDtos, viewDtos);
			loadMetaAfterProcess();
			return null;
		});
	}

	@SneakyThrows
	private String getValueOrNull(Object actionOrGroup) {
		return objectMapper.writeValueAsString(actionOrGroup);
	}

	@SneakyThrows
	private Options readValue(String options, Class<Options> valueType) {
		return objectMapper.readValue(options, valueType);
	}

	public void responsibilitiesProcess(List<ScreenSourceDto> screenDtos, List<ViewSourceDTO> viewDtos) {
		if (config.isViewAllowedRolesEnabled()) {
			Map<String, String> viewToScreenMap = new HashMap<>();
			metaRepository.getAllScreens()
					.forEach((screenName, screenDto) -> ((ScreenDTO) screenDto.getMeta()).getViews().stream()
							.map(ViewDTO::getName)
							.forEach(viewName -> viewToScreenMap.put(viewName, screenName)));

			List<Responsibilities> responsibilities = new ArrayList<>();
			viewDtos.forEach(view -> {
				view.getRolesAllowed().forEach(role -> {
					responsibilities.add(new Responsibilities()
							.setResponsibilityType(ResponsibilityType.VIEW)
							.setInternalRoleCD(role)
							.setView(view.getName()));
				});
			});
			metaRepository.deleteAndSaveResponsibilities(responsibilities);

		}
	}

	protected void loadMetaAfterProcess() {

	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Options {

		@JsonProperty("actionGroups")
		private ActionGroupsDTO actionGroups;

	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class ActionGroupsDTO {

		@JsonProperty("include")
		private List<Object> include;

	}


}
