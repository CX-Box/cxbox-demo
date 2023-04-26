package org.demo.service;

import org.demo.dto.ResponsibleDTO;
import org.demo.dto.ResponsibleDTO_;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.springframework.stereotype.Service;

@Service
public class ResponsiblePickListMeta extends FieldMetaBuilder<ResponsibleDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ResponsibleDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(
				ResponsibleDTO_.name
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ResponsibleDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {

	}

}
