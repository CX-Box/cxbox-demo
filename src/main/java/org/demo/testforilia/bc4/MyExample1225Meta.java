package org.demo.testforilia.bc4;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;

import org.springframework.stereotype.Service;

@Service
public class MyExample1225Meta extends FieldMetaBuilder<MyExample1225DTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MyExample1225DTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(MyExample1225DTO_.customField);
		fields.setRequired(MyExample1225DTO_.customField);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MyExample1225DTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
	}

}