package org.demo.service.cxbox.anysource.salestatsfordashboard;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.crudma.PlatformRequest;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO_;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.entity.enums.SaleStatus;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SaleStatsDrilldownFilterService {

	private final PlatformRequest platformRequest;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	public StringBuilder appendDrilldownFilterByFieldOfActivityFilter() {
		StringBuilder urlFilterBuilder = new StringBuilder();
		Optional.ofNullable(parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc()))
				.filter(field -> !field.getValues().isEmpty())
				.ifPresent(field -> {
					Set<FieldOfActivity> fieldOfActivitySet = field.getValues().stream()
							.map(value -> FieldOfActivity.getByValue(value.getValue()))
							.collect(Collectors.toSet());

					String encodedFilter = URLEncoder.encode(
							"&" + SaleDTO_.fieldOfActivity.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName()
									+ "=[\\\"" +
									fieldOfActivitySet.stream()
											.map(v -> "\\\"" + v.getValue() + "\\\"")
											.collect(Collectors.joining(", ")) +
									"\\\"]", StandardCharsets.UTF_8);

					urlFilterBuilder.append(encodedFilter);
				});

		return urlFilterBuilder;
	}

	private BusinessComponent getBc() {
		return platformRequest.getBc();
	}


	public StringBuilder appendDrilldownFilterSalesByDate(RowDependentFieldsMeta<DashboardSalesProductDualDTO> fields)
			throws ParseException {
		StringBuilder urlFilterBuilder = new StringBuilder();
		if (fields.getCurrentValue(DashboardSalesProductDualDTO_.dateCreatedSales).isPresent()) {
			String dateTimeStartString = formatDate(fields, 0);
			String dateTimeEndString = formatDate(fields, 1);

			urlFilterBuilder.append(URLEncoder.encode(
					SaleDTO_.dateCreatedSales.getName() + "." + SearchOperation.GREATER_OR_EQUAL_THAN.getOperationName() + "=" +
							dateTimeStartString
							+ "&" + SaleDTO_.dateCreatedSales.getName() + "." + SearchOperation.LESS_THAN.getOperationName() + "=" +
							dateTimeEndString, StandardCharsets.UTF_8));

		}
		return urlFilterBuilder;
	}

	public StringBuilder appendDrilldownFilterSalesByStatus(RowDependentFieldsMeta<DashboardSalesProductDualDTO> fields) {
		StringBuilder urlFilterBuilder = new StringBuilder();
		if (fields.getCurrentValue(DashboardSalesProductDualDTO_.saleStatus).isPresent()) {
			urlFilterBuilder.append(URLEncoder.encode("&", StandardCharsets.UTF_8))
					.append(URLEncoder.encode(
							SaleDTO_.status.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName() + "=[\\\"" +
									SaleStatus.valueOf(fields.getCurrentValue(DashboardSalesProductDualDTO_.saleStatus).get()
													.toString())
											.getValue() + "\\\"]",
							StandardCharsets.UTF_8
					));
		}
		return urlFilterBuilder;
	}

	private String formatDate(RowDependentFieldsMeta<DashboardSalesProductDualDTO> fields, int monthOffset)
			throws ParseException {
		SimpleDateFormat formatIn = new SimpleDateFormat("MMMM/yyyy", Locale.ENGLISH);
		Date dateCreatedSales = formatIn.parse(fields.getCurrentValue(DashboardSalesProductDualDTO_.dateCreatedSales)
				.get());
		dateCreatedSales.setMonth(dateCreatedSales.getMonth() + monthOffset);

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
		return dateCreatedSales.toInstant()
				.atZone(ZoneId.systemDefault())
				.toLocalDateTime().format(formatter);
	}


}
