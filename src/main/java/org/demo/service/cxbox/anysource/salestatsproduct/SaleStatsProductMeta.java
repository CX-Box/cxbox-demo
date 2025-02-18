package org.demo.service.cxbox.anysource.salestatsproduct;


import java.net.URLEncoder;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDTO;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDTO_;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductMeta extends AnySourceFieldMetaBuilder<DashboardSalesProductDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardSalesProductDTO> fields, BcDescription bc,
			String id, String parentId) {

		String urlBC = "screen/sale" + "/" + CxboxRestController.sale;

		String urlFilterForField1 = URLEncoder.encode(
				SaleDTO_.clientName.getName() + "." + SearchOperation.CONTAINS.getOperationName() + "=" + fields.get(
						DashboardSalesProductDTO_.clientName).getCurrentValue());

		String urlFilter = "?filters={\""
				+ CxboxRestController.sale
				+ "\":\""
				+ urlFilterForField1
				+ "\"}";

		fields.setDrilldown(
				DashboardSalesProductDTO_.clientName,
				DrillDownType.INNER,
				urlBC + urlFilter
		);

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardSalesProductDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}
