package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.ContactDTO;
import org.demo.dto.cxbox.inner.ContactDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ContactPickListMeta extends FieldMetaBuilder<ContactDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ContactDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(
				ContactDTO_.id
		);
		fields.setEnabled(
				ContactDTO_.fullName
		);
		fields.setEnabled(
				ContactDTO_.phoneNumber
		);
		fields.setEnabled(
				ContactDTO_.email
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ContactDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(
				ContactDTO_.id
		);
		fields.enableFilter(
				ContactDTO_.fullName
		);
		fields.enableFilter(
				ContactDTO_.phoneNumber
		);
		fields.enableFilter(
				ContactDTO_.email
		);
	}

}
