package org.demo.testforilia.bc1;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;

import org.springframework.stereotype.Service;

@Service
public class MyExample1222Meta extends FieldMetaBuilder<MyExample1222DTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MyExample1222DTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(MyExample1222DTO_.customField);
		fields.setRequired(MyExample1222DTO_.customField);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MyExample1222DTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
	}

}