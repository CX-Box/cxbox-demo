package org.demo.service;

import org.demo.dto.ContactDTO;
import org.demo.dto.ContactDTO_;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.springframework.stereotype.Service;

@Service
public class ClientContactMeta extends FieldMetaBuilder<ContactDTO>  {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ContactDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(
				ContactDTO_.fullName,
				ContactDTO_.email,
				ContactDTO_.phoneNumber
		);
		fields.setRequired(
				ContactDTO_.fullName,
				ContactDTO_.email,
				ContactDTO_.phoneNumber
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ContactDTO> fields, InnerBcDescription bcDescription, Long parentId) {

	}

}
