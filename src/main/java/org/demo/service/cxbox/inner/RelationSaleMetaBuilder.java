package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.RelationSaleDTO;
import org.springframework.stereotype.Service;

@Service
public class RelationSaleMetaBuilder extends FieldMetaBuilder<RelationSaleDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<RelationSaleDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<RelationSaleDTO> fields, InnerBcDescription bcDescription, Long parentId) {

	}

//	@Override
//	public void buildRowDependentMeta(RowDependentFieldsMeta<RelatioSaleDTO> fields, BcDescription bcDescription,
//			String id,
//			String parentId) {
//
//	}
//
//	@Override
//	public void buildIndependentMeta(FieldsMeta<RelatioSaleDTO> fields, BcDescription bcDescription, String parentId) {
//	}

}
