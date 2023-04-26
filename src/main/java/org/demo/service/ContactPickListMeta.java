package org.demo.service;

import org.demo.dto.ContactDTO;
import org.demo.dto.ContactDTO_;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.springframework.stereotype.Service;

@Service
public class ContactPickListMeta extends FieldMetaBuilder<ContactDTO> {


	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ContactDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(
				ContactDTO_.fullName
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ContactDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {

	}

}
