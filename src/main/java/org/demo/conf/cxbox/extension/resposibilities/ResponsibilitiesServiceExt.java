package org.demo.conf.cxbox.extension.resposibilities;

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
import org.cxbox.meta.data.ScreenDTO;
import org.cxbox.meta.data.ViewDTO;
import org.cxbox.meta.data.WidgetDTO;
import org.cxbox.meta.entity.Responsibilities;
import org.cxbox.meta.metahotreload.repository.MetaRepository;
import org.cxbox.meta.metahotreload.service.MetaHotReloadServiceImpl;
import org.demo.repository.ResponsibilitiesRepository;
import org.jetbrains.annotations.NotNull;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResponsibilitiesServiceExt {

	private final TransactionService txService;

	private final MetaRepository metaRepository;

	private final ResponsibilitiesRepository resposibilitiesRepository;

	private final CxboxCachingService cxboxCachingService;

	private final ConcurrentMapCacheManager cacheManager;

	/**
	 * TODO >> update screen responsibility when first view in screen added and when last view in screen removed.
	 * See {@link MetaHotReloadServiceImpl#responsibilitiesProcess(List, List) core resp creation} process part where ResponsibilityType.SCREEN is added if and only if at least one view available in screen.
 	 */

	public Responsibilities save(Responsibilities responsibilities) {
		Responsibilities save = resposibilitiesRepository.save(responsibilities);
		if (save.getView() != null && save.getInternalRoleCD() != null) {
			refreshCacheAfterTx();
		}
		return save;
	}

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
		cacheManager.getCache(CacheConfig.USER_CACHE).clear();
		cxboxCachingService.evictUserCache();
		cxboxCachingService.evictRequestCache();
		cxboxCachingService.evictUiCache();
	}

	public Set<String> getViewsByWidgetNames(@NotNull Set<String> widgetNames) {
		Map<String, ScreenDTO> allScreens = metaRepository.getAllScreens();
		Set<String> result = new HashSet<>();
		allScreens.values().forEach(screenDTO -> screenDTO
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
		Map<String, ScreenDTO> allScreens = metaRepository.getAllScreens();
		List<WidgetDTO> viewWidgets = new ArrayList<>();
		allScreens.values().forEach(screenDTO -> {
			Optional<ViewDTO> first = screenDTO.getViews().stream().filter(viewDTO -> Objects.equals(viewDTO.getName(), view))
					.findFirst();
			first.ifPresent(viewDTO -> viewWidgets.addAll(viewDTO.getWidgets()));
		});
		return widgetToNameAndDescription(viewWidgets);
	}

	public Map<String, String> getAllWidgetsNameToDescription() {
		Map<String, ScreenDTO> allScreens = metaRepository.getAllScreens();
		List<WidgetDTO> viewWidgets = new ArrayList<>();
		allScreens.values()
				.forEach(screenDTO -> screenDTO.getViews().forEach(viewDTO -> viewWidgets.addAll(viewDTO.getWidgets())));
		return widgetToNameAndDescription(viewWidgets);
	}

	public @NotNull Map<String, String> widgetToNameAndDescription(List<WidgetDTO> viewWidgets) {
		return viewWidgets.stream().collect(Collectors.toMap(
				WidgetDTO::getName,
				widgetDTO -> "'/api/v1/../" + widgetDTO.getBcName() + "' by widget '" + widgetDTO.getName() + "'",
				(w1, w2) -> w1
		));
	}

}
