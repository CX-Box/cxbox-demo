package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.ResponsibleDTO;
import org.demo.dto.cxbox.inner.ResponsibleDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
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
