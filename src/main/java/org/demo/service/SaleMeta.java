package org.demo.service;

import org.demo.dto.SaleDTO;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class SaleMeta extends FieldMetaBuilder<SaleDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<SaleDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<SaleDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
	}

}
