package org.demo.service.cxbox.anysource.salestatsproduct;


import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDTO;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDTO_;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductMeta extends AnySourceFieldMetaBuilder<DashboardSalesProductDTO> {

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardSalesProductDTO> fields, BcDescription bc,
			String id, String parentId) {

		String urlBC = "screen/sale" + "/" + CxboxRestController.sale;

		String urlFilterForFieldClient = URLEncoder.encode(
				SaleDTO_.clientName.getName() + "." + SearchOperation.CONTAINS.getOperationName() + "=" + fields.get(
						DashboardSalesProductDTO_.clientName).getCurrentValue(), StandardCharsets.UTF_8);

		String urlFilterForFieldProduct = URLEncoder.encode(
				SaleDTO_.product.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName()
						+ "=[\\\""
						+ fields.get(DashboardSalesProductDTO_.productName).getCurrentValue(), StandardCharsets.UTF_8)
				+ "\\\"]";

		String urlFilter = "?filters={\""
				+ CxboxRestController.sale
				+ "\":\""
				+ urlFilterForFieldClient
				+ URLEncoder.encode("&", StandardCharsets.UTF_8)
				+ urlFilterForFieldProduct
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
