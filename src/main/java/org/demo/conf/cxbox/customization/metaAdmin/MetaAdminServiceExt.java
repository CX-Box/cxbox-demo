package org.demo.conf.cxbox.customization.metaAdmin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.service.tx.TransactionService;
import org.cxbox.api.util.Invoker;
import org.cxbox.core.config.cache.CacheConfig;
import org.cxbox.core.config.cache.CxboxCachingService;
import org.cxbox.core.crudma.Crudma;
import org.cxbox.core.crudma.CrudmaFactory;
import org.cxbox.core.crudma.bc.BcRegistry;
import org.cxbox.core.service.action.Actions;
import org.cxbox.meta.data.ScreenDTO;
import org.cxbox.meta.data.ViewDTO;
import org.cxbox.meta.data.WidgetDTO;
import org.cxbox.meta.metahotreload.dto.ViewSourceDTO;
import org.cxbox.meta.metahotreload.dto.WidgetSourceDTO;
import org.cxbox.meta.metahotreload.repository.MetaRepository;
import org.cxbox.meta.metahotreload.service.MetaResourceReaderService;
import org.jetbrains.annotations.NotNull;
import org.springframework.cache.Cache;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MetaAdminServiceExt {

	private final TransactionService txService;

	private final MetaRepository metaRepository;

	private final MetaResourceReaderService metaResourceReaderService;

	private final CxboxCachingService cxboxCachingService;

	private final ConcurrentMapCacheManager cacheManager;

	@Lazy
	private final CrudmaFactory crudmaFactory;

	private final BcRegistry bcRegistry;

	public void refreshCacheAfterTx() {
		txService.invokeAfterCompletion(Invoker.of(this::refreshCache));
	}

	/**
	 * TODO >> modify for clustered environments.
	 * This works only for current node.
	 * In production (e.g. cluster environment), please, run this code on all nodes.
	 * 1) If delay is acceptable - one can simply use usual spring @Scheduled (each 5min for example). But do not forget to check if any changes need to be applied before cache cleaning (to prevent performance impact).
	 * 2) Use cluster ready solutions such as queues if there are any in your infrastructure
	 */
	private void refreshCache() {
		Optional.ofNullable(cacheManager.getCache(CacheConfig.USER_CACHE)).ifPresent(Cache::clear);
		cxboxCachingService.evictUserCache();
		cxboxCachingService.evictRequestCache();
		cxboxCachingService.evictUiCache();
	}

	public Set<String> getViewsByWidgetNames(@NotNull Set<String> widgetNames) {
		var allScreens = metaRepository.getAllScreens();
		Set<String> result = new HashSet<>();
		allScreens.values().forEach(screenDTO -> ((ScreenDTO) screenDTO.getMeta())
				.getViews()
				.forEach(viewDTO -> {
					if (viewDTO.getWidgets().stream().anyMatch(widgetDTO -> widgetNames.contains(widgetDTO.getName()))) {
						result.add(viewDTO.getName());
					}
				}));
		return result;
	}

	public Map<String, String> getViewWidgetsNameToDescription(String view) {
		if (view == null || view.isEmpty()) {
			return new HashMap<>();
		}
		var allScreens = metaRepository.getAllScreens();
		List<WidgetDTO> viewWidgets = new ArrayList<>();
		allScreens.values().forEach(screenDTO -> {
			Optional<ViewDTO> first = ((ScreenDTO) screenDTO.getMeta()).getViews().stream().filter(viewDTO -> Objects.equals(viewDTO.getName(), view))
					.findFirst();
			first.ifPresent(viewDTO -> viewWidgets.addAll(viewDTO.getWidgets()));
		});
		return widgetToNameAndDescription(viewWidgets);
	}

	public Map<String, String> getAllWidgetsNameToDescription() {
		var allScreens = metaRepository.getAllScreens();
		List<WidgetDTO> viewWidgets = new ArrayList<>();
		allScreens.values()
				.forEach(screenDTO -> ((ScreenDTO) screenDTO.getMeta()).getViews().forEach(viewDTO -> viewWidgets.addAll(viewDTO.getWidgets())));
		return widgetToNameAndDescription(viewWidgets);
	}

	@NotNull
	public List<ViewSourceDTO> getAllViews() {
		return metaResourceReaderService.getViews();
	}

	@NotNull
	public Map<String, WidgetSourceDTO> getAllWidgets() {
		return metaResourceReaderService.getWidgets().stream()
				.collect(Collectors.toMap(WidgetSourceDTO::getName, e -> e));
	}


	public @NotNull Map<String, String> widgetToNameAndDescription(List<WidgetDTO> viewWidgets) {
		return viewWidgets.stream().collect(Collectors.toMap(
				WidgetDTO::getName,
				widgetDTO -> "'/api/v1/../" + widgetDTO.getBcName() + "' by widget '" + widgetDTO.getName() + "'",
				(w1, w2) -> w1
		));
	}

	public Actions<?> getActionSuggestionsByBc(String widgetBc) {
		var bcDescription = bcRegistry.getBcDescription(widgetBc);
		Crudma crudma = crudmaFactory.get(bcDescription);
		return crudma.getActions(bcDescription);
	}

}
