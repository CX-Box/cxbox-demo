package org.demo.service;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.ProductPickDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings("EmptyMethod")
@Service
public class ProductPickPickListMeta extends FieldMetaBuilder<org.demo.dto.ProductPickDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<org.demo.dto.ProductPickDTO> fields,
			InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(ProductPickDTO_.productCode);
		fields.setEnabled(org.demo.dto.ProductPickDTO_.id);
		fields.setEnabled(org.demo.dto.ProductPickDTO_.shortName);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<org.demo.dto.ProductPickDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(ProductPickDTO_.productCode);

	}

}
