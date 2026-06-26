package org.demo.service.cxbox.anysource.saleseller;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.ClientReadDTO;
import org.demo.dto.cxbox.inner.ClientReadDTO_;
import org.demo.dto.cxbox.anysource.SaleSellerStatsDTO;
import org.demo.dto.cxbox.anysource.SaleSellerStatsDTO_;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleClientSellerStatsMeta extends AnySourceFieldMetaBuilder<SaleSellerStatsDTO> {

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<SaleSellerStatsDTO> fields, BcDescription bc,
			String id, String parentId) {

		fields.setDrilldownWithFilter(
				SaleSellerStatsDTO_.sellerName,
				DrillDownType.INNER,
				"/screen/client/view/clientlist",
				fc -> fc.add(
						CxboxRestController.client, ClientReadDTO.class,
						fb -> {
							fb.input(ClientReadDTO_.fullName, fields.getCurrentValue(SaleSellerStatsDTO_.sellerName).orElse(null));
						}
				)
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<SaleSellerStatsDTO> fields, BcDescription bcDescription,
			String parentId) {
		//do nothing
	}

}
