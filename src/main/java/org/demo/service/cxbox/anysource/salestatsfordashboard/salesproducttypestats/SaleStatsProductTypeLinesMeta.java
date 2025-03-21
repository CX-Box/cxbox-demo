package org.demo.service.cxbox.anysource.salestatsfordashboard.salesproducttypestats;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductTypeLinesMeta extends AnySourceFieldMetaBuilder<DashboardSalesProductDualDTO> {

	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardSalesProductDualDTO> fields, BcDescription bc,
			String id, String parentId) {

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardSalesProductDualDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}
