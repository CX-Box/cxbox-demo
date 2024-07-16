package org.demo.testforilia.bc1parent;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;

import org.springframework.stereotype.Service;

@Service
public class MyExample1223Meta extends FieldMetaBuilder<MyExample1223DTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MyExample1223DTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(MyExample1223DTO_.customField);
		fields.setRequired(MyExample1223DTO_.customField);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MyExample1223DTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
	}

}