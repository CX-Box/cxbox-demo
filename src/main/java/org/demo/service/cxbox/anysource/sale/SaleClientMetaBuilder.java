package org.demo.service.cxbox.anysource.sale;

import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.springframework.stereotype.Service;

@Service
public class SaleClientMetaBuilder extends AnySourceFieldMetaBuilder<SaleDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<SaleDTO> fields, BcDescription bcDescription,
			String id,
			String parentId) {

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<SaleDTO> fields, BcDescription bcDescription, String parentId) {

	}

}
