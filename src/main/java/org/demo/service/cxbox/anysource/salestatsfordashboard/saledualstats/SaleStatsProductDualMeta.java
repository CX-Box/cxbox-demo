package org.demo.service.cxbox.anysource.salestatsfordashboard.saledualstats;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO_;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.demo.service.cxbox.anysource.salestatsfordashboard.SaleStatsDrilldownFilterService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductDualMeta extends AnySourceFieldMetaBuilder<DashboardSalesProductDualDTO> {


	private final SaleStatsDrilldownFilterService saleStatsDrilldownFilterService;

	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardSalesProductDualDTO> fields, BcDescription bc,
			String id, String parentId) {

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardSalesProductDualDTO> fields, BcDescription bcDescription,
			String parentId) {
		fields.setDrilldown(
				DashboardSalesProductDualDTO_.dateCreatedSales,
				DrillDownType.INNER,
				urlFilterBuilder(fields)
		);
	}

	private String urlFilterBuilder(RowDependentFieldsMeta<DashboardSalesProductDualDTO> fields) {
		try {

			String urlFilterBuilder = "?filters={\""
					+ CxboxRestController.sale
					+ "\":\""

					+ (fields.getCurrentValue(DashboardSalesProductDualDTO_.productType).isPresent() ?
					URLEncoder.encode(
							SaleDTO_.product.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName() + "=[\\\"" +
									fields.getCurrentValue(DashboardSalesProductDualDTO_.productType).get() + "\\\"]",
							StandardCharsets.UTF_8
					)
					: "")

					//add Date filter
					+ saleStatsDrilldownFilterService.appendDrilldownFilterSalesByDate(fields)

					//add Status filter
					+ saleStatsDrilldownFilterService.appendDrilldownFilterSalesByStatus(fields)

					//add FieldOfActivity filter
					+ saleStatsDrilldownFilterService.appendDrilldownFilterByFieldOfActivityFilter()
					+ "\"}";

			String urlBC = "screen/sale" + "/" + CxboxRestController.sale;
			return urlBC + urlFilterBuilder;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

}
