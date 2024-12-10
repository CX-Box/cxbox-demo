package org.demo.service.cxbox.inner.core;

import static org.demo.entity.core.RoleAction.ANY_INTERNAL_ROLE_CD;
import static org.demo.entity.core.RoleAction.ANY_VIEW;

import java.util.List;
import java.util.stream.Stream;
import lombok.AllArgsConstructor;
import org.cxbox.api.data.dictionary.SimpleDictionary;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.crudma.impl.inner.UniversalCrudmaService;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.AnySourceResponseService;
import org.cxbox.core.service.ResponseService;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.cxbox.dictionary.DictionaryProvider;
import org.cxbox.meta.metahotreload.dto.ViewSourceDTO.ViewWidgetSourceDTO;
import org.cxbox.meta.metahotreload.service.MetaResourceReaderService;
import org.demo.conf.cxbox.extension.resposibilities.ResponsibilitiesServiceExt;
import org.demo.dto.cxbox.inner.core.RoleActionDTO;
import org.demo.dto.cxbox.inner.core.RoleActionDTO_;
import org.demo.entity.dictionary.InternalRole;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
@AllArgsConstructor
public class RoleActionMeta extends FieldMetaBuilder<RoleActionDTO> {

	private final ResponsibilitiesServiceExt responsibilitiesServiceExt;

	private final MetaResourceReaderService metaResourceReaderService;

	private final DictionaryProvider dictionaryProvider;

	private final List<ResponseService> responseServices;

	private final List<AnySourceResponseService> anySourceResponseServices;

	private final List<UniversalCrudmaService> anyCrudmaServices;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<RoleActionDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {
		fields.setEnabled(RoleActionDTO_.internalRoleCD);
		fields.setConcreteValues(
				RoleActionDTO_.internalRoleCD,
				Stream.concat(
						Stream.of(new SimpleDictionary(ANY_INTERNAL_ROLE_CD, ANY_INTERNAL_ROLE_CD, true)),
						dictionaryProvider.getAll(InternalRole.class)
								.stream()
								.map(e -> new SimpleDictionary(e.key(), e.key(), true))
				).toList()
		);

		fields.setEnabled(RoleActionDTO_.action);

		//fields.setConcreteValues(RoleActionDTO_.action, responseServices.stream().flatMap(e -> e.getActions()));

		fields.setEnabled(RoleActionDTO_.widget);

		String viewName = (String) fields.get(RoleActionDTO_.view).getCurrentValue();
		fields.setConcreteValues(RoleActionDTO_.widget, responsibilitiesServiceExt.getAllViews()
				.stream()
				.filter(e -> viewName == null || viewName.equals(ANY_VIEW) || e.getName().equals(viewName))
				.flatMap(e -> e.getWidgets().stream().map(ViewWidgetSourceDTO::getWidgetName))
				.distinct()
				.map(e -> new SimpleDictionary(e, e, true))
				.toList());

		fields.setEnabled(RoleActionDTO_.view);

		String widgetName = (String) fields.get(RoleActionDTO_.widget).getCurrentValue();
		fields.setConcreteValues(
				RoleActionDTO_.view,
				Stream.concat(
						Stream.of(new SimpleDictionary(ANY_VIEW, ANY_VIEW, true)),
						responsibilitiesServiceExt.getAllViews()
								.stream()
								.filter(e -> e.getWidgets().stream().map(ViewWidgetSourceDTO::getWidgetName)
										.anyMatch(wn -> widgetName == null || wn.equals(widgetName)))
								.map(e -> new SimpleDictionary(e.getName(), e.getName(), true))
				).toList()
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<RoleActionDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableSort(RoleActionDTO_.internalRoleCD);
		fields.enableFilter(RoleActionDTO_.internalRoleCD);
		fields.setConcreteFilterValues(
				RoleActionDTO_.internalRoleCD,
				Stream.concat(
						Stream.of(new SimpleDictionary(ANY_INTERNAL_ROLE_CD, ANY_INTERNAL_ROLE_CD, true)),
						dictionaryProvider.getAll(InternalRole.class)
								.stream()
								.map(e -> new SimpleDictionary(e.key(), e.key(), true))
				).toList()
		);

		fields.enableSort(RoleActionDTO_.action);
		fields.enableFilter(RoleActionDTO_.action);

		fields.enableSort(RoleActionDTO_.widget);
		fields.enableFilter(RoleActionDTO_.widget);
		fields.setForceActive(RoleActionDTO_.widget);
		fields.setConcreteFilterValues(
				RoleActionDTO_.widget,
				metaResourceReaderService.getWidgets()
						.stream()
						.map(e -> new SimpleDictionary(e.getName(), e.getName(), true))
						.toList()
		);

		fields.enableSort(RoleActionDTO_.view);
		fields.enableFilter(RoleActionDTO_.view);
		fields.setForceActive(RoleActionDTO_.view);
		fields.setConcreteFilterValues(
				RoleActionDTO_.view,
				Stream.concat(
						Stream.of(new SimpleDictionary(ANY_VIEW, ANY_VIEW, true)),
						responsibilitiesServiceExt.getAllViews()
								.stream()
								.map(view -> new SimpleDictionary(view.getName(), view.getName(), true))
				).toList()
		);
	}

}