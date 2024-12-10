package org.demo.service.cxbox.inner.core;

import lombok.AllArgsConstructor;
import org.cxbox.api.data.dictionary.SimpleDictionary;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.cxbox.meta.metahotreload.dto.ViewSourceDTO;
import org.cxbox.meta.metahotreload.dto.WidgetSourceDTO;
import org.cxbox.meta.metahotreload.service.MetaResourceReaderService;
import org.cxbox.model.core.dao.JpaDao;
import org.demo.conf.cxbox.extension.resposibilities.ResponsibilitiesServiceExt;
import org.demo.dto.cxbox.inner.core.RoleActionDTO;
import org.demo.dto.cxbox.inner.core.RoleActionDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
@AllArgsConstructor
public class RoleActionMeta extends FieldMetaBuilder<RoleActionDTO> {

	private final JpaDao jpaDao;

	private final ResponsibilitiesServiceExt responsibilitiesServiceExt;

	private final MetaResourceReaderService metaResourceReaderService;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<RoleActionDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {
		fields.setEnabled(RoleActionDTO_.internalRoleCD);
		fields.setDictionaryValues(RoleActionDTO_.internalRoleCD);

		fields.setEnabled(RoleActionDTO_.action);

		fields.setEnabled(RoleActionDTO_.widget);
		fields.setConcreteValues(RoleActionDTO_.widget, metaResourceReaderService.getWidgets().stream()
				.map(WidgetSourceDTO::getName)
				.map(name -> new SimpleDictionary(name, name, true))
				.toList());

		fields.setEnabled(RoleActionDTO_.view);
		fields.setConcreteValues(RoleActionDTO_.view, metaResourceReaderService.getViews().stream()
				.map(ViewSourceDTO::getName)
				.map(name -> new SimpleDictionary(name, name, true))
				.toList());
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<RoleActionDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableSort(RoleActionDTO_.internalRoleCD);
		fields.enableFilter(RoleActionDTO_.internalRoleCD);

		fields.enableSort(RoleActionDTO_.action);
		fields.enableFilter(RoleActionDTO_.action);

		fields.enableSort(RoleActionDTO_.widget);
		fields.enableFilter(RoleActionDTO_.widget);
		fields.setForceActive(RoleActionDTO_.widget);

		fields.enableSort(RoleActionDTO_.view);
		fields.enableFilter(RoleActionDTO_.view);
	}

}