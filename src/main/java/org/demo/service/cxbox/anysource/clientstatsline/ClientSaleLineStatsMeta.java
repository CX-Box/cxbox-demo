package org.demo.service.cxbox.anysource.clientstatsline;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.ClientSaleLineDTO;
import org.demo.dto.cxbox.anysource.ClientSaleLineDTO_;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.demo.service.cxbox.anysource.StatisticUtils;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientSaleLineStatsMeta extends AnySourceFieldMetaBuilder<ClientSaleLineDTO> {

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	private final StatisticUtils statisticUtils;

	public void buildRowDependentMeta(RowDependentFieldsMeta<ClientSaleLineDTO> fields, BcDescription bc,
			String id, String parentId) {

		var month = fields.getCurrentValue(ClientSaleLineDTO_.month).orElse(null);
		var year = fields.getCurrentValue(ClientSaleLineDTO_.year).orElse(null);
		var clientName = fields.getCurrentValue(ClientSaleLineDTO_.fullName).orElse(null);
		var dateFrom = statisticUtils.firstDay(month, year);
		var dateTo = statisticUtils.lastDay(month, year);
		var activity = parentDtoFirstLevelCache.getParentField(
				DashboardFilterDTO_.fieldOfActivity,
				getBc()
		);

		fields.setDrilldownWithFilter(
				ClientSaleLineDTO_.dateSales,
				DrillDownType.INNER,
				"screen/sale/view/salelist",
				fc -> fc
						.add(CxboxRestController.sale, SaleDTO.class, fb -> fb
								.dateFromTo(SaleDTO_.saleDate, dateFrom, dateTo)
								.input(SaleDTO_.clientName, clientName)
								.multipleSelect(SaleDTO_.fieldOfActivity, activity)
						)
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ClientSaleLineDTO> fields, BcDescription bcDescription,
			String parentId) {
		// do nothing
	}

}
