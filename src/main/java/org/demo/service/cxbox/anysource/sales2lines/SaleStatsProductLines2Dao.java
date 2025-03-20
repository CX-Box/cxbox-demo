package org.demo.service.cxbox.anysource.sales2lines;


import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.LongSummaryStatistics;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO;
import org.demo.entity.Sale;
import org.demo.entity.dictionary.Product;
import org.demo.entity.enums.SaleStatus;
import org.demo.repository.SaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductLines2Dao extends AbstractAnySourceBaseDAO<DashboardSalesProductDualDTO> implements
		AnySourceBaseDAO<DashboardSalesProductDualDTO> {

	private final SaleRepository saleRepository;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	@Override
	public String getId(final DashboardSalesProductDualDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final DashboardSalesProductDualDTO entity) {
		entity.setId(id);
	}

	@Override
	public DashboardSalesProductDualDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getStats(bc).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<DashboardSalesProductDualDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getStats(bc));
	}

	@Override
	public DashboardSalesProductDualDTO update(BusinessComponent bc, DashboardSalesProductDualDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public DashboardSalesProductDualDTO create(final BusinessComponent bbc, final DashboardSalesProductDualDTO entity) {
		throw new IllegalStateException();
	}

	@NonNull
	private List<DashboardSalesProductDualDTO> getStats(BusinessComponent bc) {
		List<DashboardSalesProductDualDTO> result = new ArrayList<>();
		List<Sale> 		sales = saleRepository.findAllByStatusIn(List.of(SaleStatus.OPEN, SaleStatus.CLOSED));;
		//data for dashboardSalesLine2D
		Map<String, Map<Product, LongSummaryStatistics>> salesLineSummary = sales.stream()
				.filter(f -> f.getDateCreatedSales() != null)
				.collect(Collectors.groupingBy(
						s -> DateTimeFormatter.ofPattern("MMMM/yyyy", Locale.ENGLISH).format(s.getDateCreatedSales()),
						Collectors.groupingBy(Sale::getProduct, Collectors.summarizingLong(Sale::getSum))
				));

		final int[] nextId = {0};
		salesLineSummary.forEach((dateCreated, productStats) -> productStats.forEach((product, stats) -> {
			DashboardSalesProductDualDTO prod = new DashboardSalesProductDualDTO();
			prod.setProductType(product.key());
			prod.setId(String.valueOf(nextId[0] + 1));
			nextId[0] = nextId[0] + 1;
			prod.setDateCreatedSales(dateCreated);
			prod.setSum(stats.getSum());
			prod.setColor(Objects.equals(product.key(), Product.EXPERTISE.key()) ? "#4D83E7" : "#30BA8F");
			result.add(prod);
		}));


		return result;
	}


}
