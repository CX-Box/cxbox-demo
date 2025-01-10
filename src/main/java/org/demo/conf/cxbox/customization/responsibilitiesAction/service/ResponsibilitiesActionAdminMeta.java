package org.demo.conf.cxbox.customization.responsibilitiesAction.service;

import static org.cxbox.meta.entity.ResponsibilitiesAction.ANY_INTERNAL_ROLE_CD;
import static org.cxbox.meta.entity.ResponsibilitiesAction.ANY_VIEW;
import static org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ResponsibilitiesActionAdminDTO_.*;

import com.google.common.base.Objects;
import java.util.Optional;
import java.util.stream.Stream;
import lombok.AllArgsConstructor;
import org.cxbox.api.data.dictionary.SimpleDictionary;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.crudma.state.BcStateAware;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.cxbox.dictionary.DictionaryProvider;
import org.cxbox.meta.metahotreload.dto.ViewSourceDTO.ViewWidgetSourceDTO;
import org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ResponsibilitiesActionAdminDTO;
import org.demo.conf.cxbox.customization.metaAdmin.MetaAdminServiceExt;
import org.demo.entity.dictionary.InternalRole;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
@AllArgsConstructor
public class ResponsibilitiesActionAdminMeta extends FieldMetaBuilder<ResponsibilitiesActionAdminDTO> {

	private final MetaAdminServiceExt metaAdminServiceExt;

	private final DictionaryProvider dictionaryProvider;

	private final BcStateAware bcStateAware;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ResponsibilitiesActionAdminDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {
		fields.setEnabled(internalRoleCD);
		fields.setRequired(internalRoleCD);
		fields.setConcreteValues(
				internalRoleCD,
				Stream.concat(
						Stream.of(new SimpleDictionary(ANY_INTERNAL_ROLE_CD, ANY_INTERNAL_ROLE_CD, true)),
						dictionaryProvider.getAll(InternalRole.class)
								.stream()
								.map(e -> new SimpleDictionary(e.key(), e.key(), true))
				).toList()
		);

		fields.setEnabled(widget);
		fields.setRequired(widget);

		String viewName = (String) fields.get(view).getCurrentValue();
		fields.setConcreteValues(widget, metaAdminServiceExt.getAllViews()
				.stream()
				.filter(e -> viewName == null || viewName.equals(ANY_VIEW) || e.getName().equals(viewName))
				.flatMap(e -> e.getWidgets().stream().map(ViewWidgetSourceDTO::getWidgetName))
				.distinct()
				.map(e -> new SimpleDictionary(e, e, true))
				.toList());

		fields.setEnabled(view);
		fields.setRequired(view);

		String widgetName = (String) fields.get(widget).getCurrentValue();
		var prevWidgetName = Optional.ofNullable(bcStateAware.getState(getBc()))
				.map(e -> (ResponsibilitiesActionAdminDTO) e.getDto())
				.map(ResponsibilitiesActionAdminDTO::getWidget)
				.orElse(null);
		if (prevWidgetName != null && !Objects.equal(widgetName, prevWidgetName)) {
			fields.setCurrentValue(actionKey, null);
		}
		fields.setRequired(actionKey);
		if (widgetName != null) {
			fields.setEnabled(actionKey);
		}

		fields.setConcreteValues(
				view,
				Stream.concat(
						Stream.of(new SimpleDictionary(ANY_VIEW, ANY_VIEW, true)),
						metaAdminServiceExt.getAllViews()
								.stream()
								.filter(e -> e.getWidgets().stream().map(ViewWidgetSourceDTO::getWidgetName)
										.anyMatch(wn -> widgetName == null || wn.equals(widgetName)))
								.map(e -> new SimpleDictionary(e.getName(), e.getName(), true))
				).toList()
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ResponsibilitiesActionAdminDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableSort(internalRoleCD);
		fields.enableFilter(internalRoleCD);
		fields.setConcreteFilterValues(
				internalRoleCD,
				Stream.concat(
						Stream.of(new SimpleDictionary(ANY_INTERNAL_ROLE_CD, ANY_INTERNAL_ROLE_CD, true)),
						dictionaryProvider.getAll(InternalRole.class)
								.stream()
								.map(e -> new SimpleDictionary(e.key(), e.key(), true))
				).toList()
		);

		fields.enableSort(actionKey);
		fields.enableFilter(actionKey);

		fields.enableSort(widget);
		fields.enableFilter(widget);
		fields.setForceActive(widget);
		fields.setConcreteFilterValues(
				widget,
				metaAdminServiceExt.getAllWidgets().values()
						.stream()
						.map(e -> new SimpleDictionary(e.getName(), e.getName(), true))
						.toList()
		);

		fields.enableSort(view);
		fields.enableFilter(view);
		fields.setForceActive(view);
		fields.setConcreteFilterValues(
				view,
				Stream.concat(
						Stream.of(new SimpleDictionary(ANY_VIEW, ANY_VIEW, true)),
						metaAdminServiceExt.getAllViews()
								.stream()
								.map(view -> new SimpleDictionary(view.getName(), view.getName(), true))
				).toList()
		);
	}

}