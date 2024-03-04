package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.ContactMultivalueDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings("EmptyMethod")
@Service
public class ContactMultivalueMeta extends FieldMetaBuilder<ContactMultivalueDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ContactMultivalueDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {
		fields.setEnabled(org.demo.dto.ContactMultivalueDTO_.id);
		fields.setEnabled(org.demo.dto.ContactMultivalueDTO_.fullName);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ContactMultivalueDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {

	}

}
