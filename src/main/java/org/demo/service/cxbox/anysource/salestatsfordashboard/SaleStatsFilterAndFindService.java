package org.demo.service.cxbox.anysource.salestatsfordashboard;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.LongSummaryStatistics;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.crudma.PlatformRequest;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.demo.entity.Sale;
import org.demo.entity.dictionary.Product;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.entity.enums.SaleStatus;
import org.demo.repository.SaleRepository;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SaleStatsFilterAndFindService {
	private final PlatformRequest platformRequest;
	private final SaleRepository saleRepository;
	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	public StringBuilder appendFieldOfActivityFilter(StringBuilder urlFilterBuilder) {
		Optional.ofNullable(parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc()))
				.filter(field -> !field.getValues().isEmpty())
				.ifPresent(field -> {
					Set<FieldOfActivity> fieldOfActivitySet = field.getValues().stream()
							.map(value -> FieldOfActivity.getByValue(value.getValue()))
							.collect(Collectors.toSet());

					String encodedFilter = URLEncoder.encode(
							"&" + SaleDTO_.fieldOfActivity.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName() + "=[\\\"" +
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

	public List<Sale> getFilteredSalesByStatusAndFieldOfActivity(BusinessComponent bc) {
		return Optional.ofNullable(parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc))
				.filter(field -> !field.getValues().isEmpty())
				.map(field -> field.getValues().stream()
						.map(value -> FieldOfActivity.getByValue(value.getValue()))
						.collect(Collectors.toSet()))
				.map(filteredActivities -> saleRepository.findAllByClientFieldOfActivitiesInAndStatusIn(
						filteredActivities,
						List.of(SaleStatus.OPEN, SaleStatus.CLOSED)
				))
				.orElseGet(() -> saleRepository.findAllByStatusIn(List.of(SaleStatus.OPEN, SaleStatus.CLOSED)));
	}

	public List<Sale> getFilteredSalesByFieldOfActivity(BusinessComponent bc) {
		return Optional.ofNullable(parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc))
				.filter(field -> !field.getValues().isEmpty())
				.map(field -> field.getValues().stream()
						.map(value -> FieldOfActivity.getByValue(value.getValue()))
						.collect(Collectors.toSet()))
				.map(saleRepository::findAllByClientFieldOfActivitiesIn)
				.orElseGet(saleRepository::findAll);
	}

	public List<DashboardSalesProductDualDTO> processSalesByStatusGroupByDateColumnData(List<Sale> sales,
			List<DashboardSalesProductDualDTO> result) {
		Map<String, Map<SaleStatus, Long>> salesColumnSummary = sales.stream()
				.filter(sale -> sale.getDateCreatedSales() != null)
				.collect(Collectors.groupingBy(
						sale -> DateTimeFormatter.ofPattern("MMMM/yyyy", Locale.ENGLISH).format(sale.getDateCreatedSales()),
						Collectors.groupingBy(Sale::getStatus, Collectors.counting())
				));

		final int[] nextId = {0};
		salesColumnSummary.forEach((dateCreated, productStats) -> productStats.forEach((saleStatus, stats) -> {
			DashboardSalesProductDualDTO prod = new DashboardSalesProductDualDTO();
			prod.setCount(stats);
			prod.setId(String.valueOf(++nextId[0]));
			prod.setDateCreatedSales(dateCreated);
			prod.setSaleStatus(saleStatus);
			prod.setColor(saleStatus == SaleStatus.CLOSED ? "#4D83E7" : "#30BA8F");
			result.add(prod);
		}));

		return result;
	}

	public List<DashboardSalesProductDualDTO> processSalesByProductTypeGroupByDateLineData(List<Sale> sales,
			List<DashboardSalesProductDualDTO> result) {
		Map<String, Map<Product, LongSummaryStatistics>> salesLineSummary = sales.stream()
				.filter(sale -> sale.getDateCreatedSales() != null)
				.collect(Collectors.groupingBy(
						sale -> DateTimeFormatter.ofPattern("MMMM/yyyy", Locale.ENGLISH).format(sale.getDateCreatedSales()),
						Collectors.groupingBy(Sale::getProduct, Collectors.summarizingLong(Sale::getSum))
				));

		final int[] nextId = {0};
		salesLineSummary.forEach((dateCreated, productStats) -> productStats.forEach((product, stats) -> {
			DashboardSalesProductDualDTO prod = new DashboardSalesProductDualDTO();
			prod.setProductType(product.key());
			prod.setId(String.valueOf(++nextId[0]));
			prod.setDateCreatedSales(dateCreated);
			prod.setSum(stats.getSum());
			prod.setColor(Objects.equals(product.key(), Product.EXPERTISE.key()) ? "#5D7092" : "#70925d");
			result.add(prod);
		}));

		return result;
	}

}
