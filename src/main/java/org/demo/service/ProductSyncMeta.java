package org.demo.service;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.ProductSyncDTO;
import org.demo.dto.ProductSyncDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ProductSyncMeta extends FieldMetaBuilder<ProductSyncDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ProductSyncDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(ProductSyncDTO_.pageSize);

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ProductSyncDTO> fields, InnerBcDescription bcDescription, Long parentId) {
		fields.enableFilter(ProductSyncDTO_.pageSize);

	}

}
