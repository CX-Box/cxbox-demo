package org.demo.service.cxbox.anysource.salestatsproduct;


import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.crudma.PlatformRequest;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDTO;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDTO_;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.demo.entity.enums.FieldOfActivity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductMeta extends AnySourceFieldMetaBuilder<DashboardSalesProductDTO> {

	@Autowired
	private PlatformRequest platformRequest;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardSalesProductDTO> fields, BcDescription bc,
			String id, String parentId) {

		fields.setDrilldown(
				DashboardSalesProductDTO_.clientName,
				DrillDownType.INNER,
				urlFilterBuilder(fields)
		);
	}


	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardSalesProductDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

	private String urlFilterBuilder(RowDependentFieldsMeta<DashboardSalesProductDTO> fields) {
		StringBuilder urlFilterBuilder = new StringBuilder("?filters={\"")
				.append(CxboxRestController.sale)
				.append("\":\"");

		urlFilterBuilder.append(URLEncoder.encode(
				SaleDTO_.clientName.getName() + "." + SearchOperation.CONTAINS.getOperationName() + "=" +
						fields.get(DashboardSalesProductDTO_.clientName).getCurrentValue(), StandardCharsets.UTF_8));

		urlFilterBuilder.append(URLEncoder.encode("&", StandardCharsets.UTF_8))
				.append(URLEncoder.encode(
						SaleDTO_.product.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName() + "=[\\\"" +
								fields.get(DashboardSalesProductDTO_.productName).getCurrentValue() + "\\\"]", StandardCharsets.UTF_8));

		if (parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc()) != null &&
				!parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc()).getValues().isEmpty()) {
			Set<FieldOfActivity> fieldOfActivitySet = parentDtoFirstLevelCache.getParentField(
							DashboardFilterDTO_.fieldOfActivity,
							getBc()
					)
					.getValues().stream()
					.map(v -> FieldOfActivity.getByValue(v.getValue()))
					.collect(Collectors.toSet());

			urlFilterBuilder.append(URLEncoder.encode(
					"&" + SaleDTO_.fieldOfActivity.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName() + "=[\\\"" +
							fieldOfActivitySet.stream()
									.map(v -> "\\\"" + v.getValue() + "\\\"")
									.collect(Collectors.joining(", ")) +
							"\\\"]", StandardCharsets.UTF_8));
		}

		urlFilterBuilder.append("\"}");

		String urlBC = "screen/sale" + "/" + CxboxRestController.sale;
		return urlBC + urlFilterBuilder;
	}

	private BusinessComponent getBc() {
		return this.platformRequest.getBc();
	}

}
