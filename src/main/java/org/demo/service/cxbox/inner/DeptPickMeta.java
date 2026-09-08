package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.DeptDTO;
import org.demo.dto.cxbox.inner.DeptDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class DeptPickMeta extends FieldMetaBuilder<DeptDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DeptDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {
		fields.setEnabled(DeptDTO_.fullName, DeptDTO_.code);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DeptDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(DeptDTO_.fullName, DeptDTO_.code);
		fields.enableSort(DeptDTO_.fullName);
	}

}
