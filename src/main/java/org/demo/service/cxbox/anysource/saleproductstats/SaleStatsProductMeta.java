package org.demo.service.cxbox.anysource.saleproductstats;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.cxbox.core.crudma.PlatformRequest;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.cxbox.core.util.filter.drilldowns.TypeToken;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDTO;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDTO_;
import org.demo.dto.cxbox.inner.ClientReadDTO;
import org.demo.dto.cxbox.inner.ClientReadDTO_;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.demo.test.CustomFilterBuilder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductMeta extends AnySourceFieldMetaBuilder<DashboardSalesProductDTO> {

	private final PlatformRequest platformRequest;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	@SneakyThrows
	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardSalesProductDTO> fields, BcDescription bc,
			String id, String parentId) {
		var activity = parentDtoFirstLevelCache.getParentField(
				DashboardFilterDTO_.fieldOfActivity,
				platformRequest.getBc()
		);

		fields.setDrilldownWithFilter(
				DashboardSalesProductDTO_.clientName,
				DrillDownType.INNER,
				"screen/sale/view/salelist",
				fc -> fc
						.add(fcm -> fcm.customBuilder(
										CxboxRestController.sale,
										new TypeToken<CustomFilterBuilder<SaleDTO>>() {
										}
								).filters(fb -> fb
										.input(SaleDTO_.clientName, fields.getCurrentValue(DashboardSalesProductDTO_.clientName).orElse(null))
										.dictionary(
												SaleDTO_.product,
												fields.getCurrentValue(DashboardSalesProductDTO_.productName).orElse(null)
										)
										.multiValue(SaleDTO_.fieldOfActivity, activity))
						)
						.add(fcm -> fcm
								.defaultBuilder(CxboxRestController.client, ClientReadDTO.class)
								.filters(fb -> fb.input(ClientReadDTO_.id, "123"))
						)

		);
	}


	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardSalesProductDTO> fields, BcDescription bcDescription,
			String parentId) {
		// do nothing
	}

}
