package org.demo.service;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.UserPickDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings("EmptyMethod")
@Service
public class UserPickMeta extends FieldMetaBuilder<UserPickDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<UserPickDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(org.demo.dto.UserPickDTO_.id);
		fields.setEnabled(org.demo.dto.UserPickDTO_.fullUserName);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<UserPickDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {

	}

}
