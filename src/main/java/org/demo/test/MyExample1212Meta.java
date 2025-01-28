package org.demo.test;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.springframework.stereotype.Service;

@Service
public class MyExample1212Meta extends FieldMetaBuilder<MyExample1212DTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MyExample1212DTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(MyExample1212DTO_.customFieldNumber);
		fields.setEnabled(org.demo.test.MyExample1212DTO_.customFieldDrilldown);
		fields.setEnabled(MyExample1212DTO_.customField);
		fields.setDrilldown(
				MyExample1212DTO_.customFieldDrilldown,
				DrillDownType.INNER,
				"/screen/myexample1212/view/myexample1212form/" + CxboxMyExample1212Controller.myexample1212 + "/" + id
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MyExample1212DTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(MyExample1212DTO_.customFieldNumber);
		fields.enableFilter(org.demo.test.MyExample1212DTO_.customFieldDrilldown);
	}

}