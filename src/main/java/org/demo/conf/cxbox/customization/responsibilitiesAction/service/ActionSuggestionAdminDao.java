package org.demo.conf.cxbox.customization.responsibilitiesAction.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.cxbox.api.util.i18n.LocalizationFormatter;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.action.ActionDescription;
import org.cxbox.core.service.action.ActionGroupDescription;
import org.cxbox.core.service.action.Actions;
import org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ActionSuggestionAdminDTO;
import org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ResponsibilitiesActionAdminDTO_;
import org.demo.conf.cxbox.customization.metaAdmin.MetaAdminServiceExt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActionSuggestionAdminDao extends AbstractAnySourceBaseDAO<ActionSuggestionAdminDTO> implements
		AnySourceBaseDAO<ActionSuggestionAdminDTO> {

	private static final String SEARCH_QUERY_PARAMETER = "query";

	private static final String SEARCH_COUNT_PARAMETER = "_limit";

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	private final MetaAdminServiceExt metaAdminServiceExt;

	@Override
	public String getId(final ActionSuggestionAdminDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final ActionSuggestionAdminDTO entity) {
		entity.setId(id);
	}

	@Override
	public ActionSuggestionAdminDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getSuggestions(bc).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<ActionSuggestionAdminDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getSuggestions(bc));
	}

	@Override
	public ActionSuggestionAdminDTO update(BusinessComponent bc, ActionSuggestionAdminDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public ActionSuggestionAdminDTO create(final BusinessComponent bc, final ActionSuggestionAdminDTO entity) {
		throw new IllegalStateException();
	}

	private List<ActionSuggestionAdminDTO> getSuggestions(BusinessComponent bc) {
		String query = Optional.ofNullable(bc.getParameters())
				.map(e -> e.getParameter(SEARCH_QUERY_PARAMETER))
				.orElse(null);
		Integer countParameter = Optional.ofNullable(bc.getParameters())
				.map(busComp -> busComp.getParameter(SEARCH_COUNT_PARAMETER))
				.filter(StringUtils::isNumeric)
				.map(Integer::parseInt)
				.orElse(100);

		String widgetBc = parentDtoFirstLevelCache.getParentField(ResponsibilitiesActionAdminDTO_.bc, bc);
		if (widgetBc != null) {
			Actions<?> e = metaAdminServiceExt.getActionSuggestionsByBc(widgetBc);
			List<ActionDescription> actionDefinitions = ((Actions) e).getActionDefinitions();
			var actionsDefs = actionDefinitions
					.stream()
					.<ActionSuggestionAdminDTO>map(a -> ActionSuggestionAdminDTO
							.builder()
							.id(a.getKey())
							.value(a.getKey())
							.text(a.getText())
							.description("(single action)")
							.build())
					.sorted(Comparator.comparing(ActionSuggestionAdminDTO::getValue))
					.toList();
			List<ActionSuggestionAdminDTO> actionOptions = new ArrayList<>(actionsDefs);
			var actionGroupDefinitions = e.getActionGroupDefinitions();
			actionGroupDefinitions.stream().sorted(Comparator.comparing(ActionGroupDescription::getKey)).forEach(ag -> {
				actionOptions.add(ActionSuggestionAdminDTO
						.builder()
						.id(ag.getKey())
						.value(ag.getKey())
						.text(ag.getText())
						.description("(action group)")
						.build());
				actionOptions.addAll(ag.getActions()
						.stream()
						.map(a -> ActionSuggestionAdminDTO
								.builder()
								.id(a.getKey())
								.value(a.getKey())
								.text(a.getText())
								.description("(parent action group: " + ag.getKey() + ")")
								.build())
						.sorted(Comparator.comparing(ActionSuggestionAdminDTO::getValue))
					.toList());
			});
			return actionOptions.stream()
					.distinct()
					.filter(option -> query == null
							|| Optional.ofNullable(option.getValue()).map(op -> op.contains(query)).orElse(false)
							|| Optional.ofNullable(option.getDescription()).map(op -> op.contains(query)).orElse(false)
							|| Optional.ofNullable(option.getText()).map(LocalizationFormatter::i18n).map(op -> op.contains(query)).orElse(false)
					)
					.limit(countParameter)
					.toList();
		}
		return new ArrayList<>();
	}



}
