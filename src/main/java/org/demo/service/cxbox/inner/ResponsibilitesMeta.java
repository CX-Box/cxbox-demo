package org.demo.service.cxbox.inner;

import static org.demo.conf.cxbox.extension.lov.AdministeredDictionaryType.INTERNAL_ROLE;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;

import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.demo.dto.cxbox.inner.ResponsibilitesCreateDTO;
import org.demo.dto.cxbox.inner.ResponsibilitesCreateDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ResponsibilitesMeta extends FieldMetaBuilder<ResponsibilitesCreateDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ResponsibilitesCreateDTO> fields,
			InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setDictionaryTypeWithAllValues(ResponsibilitesCreateDTO_.internalRoleCD, INTERNAL_ROLE);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ResponsibilitesCreateDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.setAllFilterValuesByLovType(ResponsibilitesCreateDTO_.internalRoleCD, INTERNAL_ROLE);
	}

}
