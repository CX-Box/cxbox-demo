package org.demo.service.cxbox.anysource.salesstatsproducttypedate;


import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
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
import org.demo.dto.cxbox.anysource.DashboardSalesProductTypeDateDTO;
import org.demo.entity.Sale;
import org.demo.entity.dictionary.Product;
import org.demo.entity.enums.SaleStatus;
import org.demo.repository.DashboardFilterRepository;
import org.demo.repository.SaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductTypeDateDao extends AbstractAnySourceBaseDAO<DashboardSalesProductTypeDateDTO> implements
		AnySourceBaseDAO<DashboardSalesProductTypeDateDTO> {

	private final DashboardFilterRepository dashboardFilterRepository;

	private final SaleRepository saleRepository;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;


	@Override
	public String getId(final DashboardSalesProductTypeDateDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final DashboardSalesProductTypeDateDTO entity) {
		entity.setId(id);
	}

	@Override
	public DashboardSalesProductTypeDateDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getStats(bc).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<DashboardSalesProductTypeDateDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getStats(bc));
	}

	@Override
	public DashboardSalesProductTypeDateDTO update(BusinessComponent bc, DashboardSalesProductTypeDateDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public DashboardSalesProductTypeDateDTO create(final BusinessComponent bbc, final DashboardSalesProductTypeDateDTO entity) {
		throw new IllegalStateException();
	}

	@NonNull
	private List<DashboardSalesProductTypeDateDTO> getStats(BusinessComponent bc) {
		List<DashboardSalesProductTypeDateDTO> result = new ArrayList<>();
		List<Sale> sales = saleRepository.findAllByStatusIn(List.of(SaleStatus.OPEN,SaleStatus.CLOSED));


		Map<String ,Map<Product, LongSummaryStatistics>> salesSummary = sales.stream().filter(f -> f.getDateCreatedSales() != null)
				.collect(Collectors.groupingBy(
						s-> DateTimeFormatter.ofPattern("MMMM/yyyy").format(s.getDateCreatedSales()),
						Collectors.groupingBy(Sale::getProduct, Collectors.summarizingLong(Sale::getSum))));

		final int[] nextId = {0};
		salesSummary.forEach((dateCreated, productStats) -> productStats.forEach((product, stats) -> {
			DashboardSalesProductTypeDateDTO prod = new DashboardSalesProductTypeDateDTO();
			prod.setProductType(product.key());
			prod.setId(String.valueOf(nextId[0] +1));
			nextId[0] = nextId[0] +1;
			prod.setDateCreatedSales(dateCreated);
			prod.setSum(stats.getSum());
			result.add(prod);
		}));
		return result;
	}


}
