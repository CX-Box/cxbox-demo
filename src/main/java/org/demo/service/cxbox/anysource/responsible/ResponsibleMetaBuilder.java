package org.demo.service.cxbox.anysource.responsible;

import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.ResponsibleDTO;
import org.demo.dto.cxbox.inner.ResponsibleDTO_;
import org.springframework.stereotype.Service;

@Service
public class ResponsibleMetaBuilder extends AnySourceFieldMetaBuilder<ResponsibleDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ResponsibleDTO> fields, BcDescription bcDescription,
			String id,
			String parentId) {
		fields.setEnabled(
				ResponsibleDTO_.id
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ResponsibleDTO> fields, BcDescription bcDescription, String parentId) {
		fields.enableFilter(
				ResponsibleDTO_.id);
		fields.enableSort(
				ResponsibleDTO_.id);
	}

}
