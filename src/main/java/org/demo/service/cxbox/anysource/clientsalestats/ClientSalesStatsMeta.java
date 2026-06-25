package org.demo.service.cxbox.anysource.clientsalestats;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.BaseStatsDTO;
import org.demo.dto.cxbox.anysource.BaseStatsDTO_;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientSalesStatsMeta extends AnySourceFieldMetaBuilder<BaseStatsDTO> {

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<BaseStatsDTO> fields, BcDescription bc,
			String id, String parentId) {

		var activity = parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc());

		fields.setDrilldownWithFilter(
				BaseStatsDTO_.value,
				DrillDownType.INNER,
				"screen/sale/view/salelist",
				fc -> fc
						.add(
								CxboxRestController.sale, SaleDTO.class, fb -> fb
										.input(
												SaleDTO_.clientName,
												fields.getCurrentValue(BaseStatsDTO_.title).orElse(null)
										)
										.multipleSelect(SaleDTO_.fieldOfActivity, activity)
						)
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<BaseStatsDTO> fields, BcDescription bcDescription,
			String parentId) {
		//do nothing
	}

}
