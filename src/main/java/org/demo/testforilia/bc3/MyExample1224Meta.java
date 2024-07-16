package org.demo.testforilia.bc3;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;

import org.springframework.stereotype.Service;

@Service
public class MyExample1224Meta extends FieldMetaBuilder<MyExample1224DTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MyExample1224DTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(MyExample1224DTO_.customField);
		fields.setRequired(MyExample1224DTO_.customField);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MyExample1224DTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
	}

}