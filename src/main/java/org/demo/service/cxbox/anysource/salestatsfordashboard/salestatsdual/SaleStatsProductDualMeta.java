package org.demo.service.cxbox.anysource.salestatsfordashboard.salestatsdual;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Locale;
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
import org.demo.entity.enums.SaleStatus;
import org.demo.service.cxbox.anysource.salestatsfordashboard.SaleStatsFilterAndFindService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductDualMeta extends AnySourceFieldMetaBuilder<DashboardSalesProductDualDTO> {

	private final SaleStatsFilterAndFindService saleStatsProductFilterService;

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
			//add Date filter
			if(!fields.getCurrentValue(DashboardSalesProductDualDTO_.dateCreatedSales).isEmpty()) {
				String dateTimeStartString = formatDate(fields, 0);
				String dateTimeEndString = formatDate(fields, 1);


				urlFilterBuilder.append(URLEncoder.encode(
						SaleDTO_.dateCreatedSales.getName() + "." + SearchOperation.GREATER_OR_EQUAL_THAN.getOperationName() + "=" +
								dateTimeStartString
								+ "&" + SaleDTO_.dateCreatedSales.getName() + "." + SearchOperation.LESS_THAN.getOperationName() + "=" +
								dateTimeEndString, StandardCharsets.UTF_8));
			}

			if(!fields.getCurrentValue(DashboardSalesProductDualDTO_.saleStatus).isEmpty()) {
				//add Status filter
				urlFilterBuilder.append(URLEncoder.encode("&", StandardCharsets.UTF_8))
						.append(URLEncoder.encode(
								SaleDTO_.status.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName() + "=[\\\"" +
										SaleStatus.valueOf(fields.getCurrentValue(DashboardSalesProductDualDTO_.saleStatus).get()
														.toString())
												.getValue() + "\\\"]",
								StandardCharsets.UTF_8
						));
			}

			//add FieldOfActivity filter
			saleStatsProductFilterService.appendFieldOfActivityFilter(urlFilterBuilder);

			urlFilterBuilder.append("\"}");

			String urlBC = "screen/sale" + "/" + CxboxRestController.sale;
			return urlBC + urlFilterBuilder;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	private String formatDate(RowDependentFieldsMeta<DashboardSalesProductDualDTO> fields, int monthOffset)
			throws ParseException {
		SimpleDateFormat formatIn = new SimpleDateFormat("MMMM/yyyy", Locale.ENGLISH);
		Date dateCreatedSales = formatIn.parse(fields.getCurrentValue(DashboardSalesProductDualDTO_.dateCreatedSales).get()
				.toString());
		dateCreatedSales.setMonth(dateCreatedSales.getMonth() + monthOffset);

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
		return dateCreatedSales.toInstant()
				.atZone(ZoneId.systemDefault())
				.toLocalDateTime().format(formatter);
	}


}
