package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.UserDTO;
import org.demo.dto.cxbox.inner.UserDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class UserPickMeta extends FieldMetaBuilder<UserDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<UserDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {
		fields.setEnabled(UserDTO_.fullName);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<UserDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(UserDTO_.fullName);
	}

}
