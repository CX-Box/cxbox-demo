package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.ContactDTO;
import org.demo.dto.cxbox.inner.ContactDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
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
