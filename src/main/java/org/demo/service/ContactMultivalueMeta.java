package org.demo.service;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.springframework.stereotype.Service;

@SuppressWarnings("EmptyMethod")
@Service
public class ContactMultivalueMeta extends FieldMetaBuilder<org.demo.dto.ContactMultivalueDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<org.demo.dto.ContactMultivalueDTO> fields,
			InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(org.demo.dto.ContactMultivalueDTO_.id);
		fields.setEnabled(org.demo.dto.ContactMultivalueDTO_.fullName);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<org.demo.dto.ContactMultivalueDTO> fields,
			InnerBcDescription bcDescription,
			Long parentId) {

	}

}
