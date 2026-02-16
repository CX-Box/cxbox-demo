package org.demo.service.cxbox.anysource.relationSale;

import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.RelationSaleDTO;
import org.springframework.stereotype.Service;

@Service
public class RelationSaleMetaBuilder extends AnySourceFieldMetaBuilder<RelationSaleDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<RelationSaleDTO> fields, BcDescription bcDescription,
			String id, String parentId) {

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<RelationSaleDTO> fields, BcDescription bcDescription, String parentId) {

	}

}
