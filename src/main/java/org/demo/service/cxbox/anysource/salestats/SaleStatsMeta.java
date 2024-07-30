package org.demo.service.cxbox.anysource.salestats;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.DashboardSalesFunnelDTO;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsMeta extends AnySourceFieldMetaBuilder<DashboardSalesFunnelDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardSalesFunnelDTO> fields, BcDescription bc,
			String id, String parentId) {
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardSalesFunnelDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}
