package org.demo.service.cxbox.anysource.salestatsdual;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Locale;
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
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO_;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.entity.enums.SaleStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductDualMeta extends AnySourceFieldMetaBuilder<DashboardSalesProductDualDTO> {

	@Autowired
	private PlatformRequest platformRequest;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

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
			StringBuilder urlFilterBuilder = new StringBuilder("?filters={\"")
					.append(CxboxRestController.sale)
					.append("\":\"");

			SimpleDateFormat formatIn = new SimpleDateFormat("MMMM/yyyy", Locale.ENGLISH);
			Date dateCreatedSales = formatIn.parse(fields.get(DashboardSalesProductDualDTO_.dateCreatedSales).getCurrentValue()
					.toString());

			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
			String dateTimeString = dateCreatedSales.toInstant()
					.atZone(ZoneId.systemDefault())
					.toLocalDateTime().format(formatter);

			urlFilterBuilder.append(URLEncoder.encode(
					SaleDTO_.dateCreatedSales.getName() + "." + SearchOperation.GREATER_OR_EQUAL_THAN.getOperationName() + "=" +
							dateTimeString
							+ "&" + SaleDTO_.dateCreatedSales.getName() + "." + SearchOperation.LESS_OR_EQUAL_THAN.getOperationName()	+ "=" +
							dateTimeString, StandardCharsets.UTF_8));

			urlFilterBuilder.append(URLEncoder.encode("&", StandardCharsets.UTF_8))
					.append(URLEncoder.encode(
							SaleDTO_.status.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName() + "=[\\\"" +
									SaleStatus.valueOf(fields.get(DashboardSalesProductDualDTO_.saleStatus).getCurrentValue().toString())
											.getValue() + "\\\"]",
							StandardCharsets.UTF_8
					));

			if (parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc()) != null &&
					!parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc()).getValues()
							.isEmpty()) {
				Set<FieldOfActivity> fieldOfActivitySet = parentDtoFirstLevelCache.getParentField(
								DashboardFilterDTO_.fieldOfActivity,
								getBc()
						)
						.getValues().stream()
						.map(v -> FieldOfActivity.getByValue(v.getValue()))
						.collect(Collectors.toSet());

				urlFilterBuilder.append(URLEncoder.encode(
						"&" + SaleDTO_.fieldOfActivity.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName() + "=[\\\""
								+
								fieldOfActivitySet.stream()
										.map(v -> "\\\"" + v.getValue() + "\\\"")
										.collect(Collectors.joining(", ")) +
								"\\\"]", StandardCharsets.UTF_8));
			}

			urlFilterBuilder.append("\"}");

			String urlBC = "screen/sale" + "/" + CxboxRestController.sale;
			return urlBC + urlFilterBuilder;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	private BusinessComponent getBc() {
		return this.platformRequest.getBc();
	}

}
