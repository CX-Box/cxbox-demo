package org.demo.service.cxbox.anysource.salestatsproduct;


import java.util.ArrayList;
import java.util.List;
import java.util.LongSummaryStatistics;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDTO;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.Client;
import org.demo.entity.Sale;
import org.demo.entity.dictionary.Product;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.DashboardFilterRepository;
import org.demo.repository.SaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductDao extends AbstractAnySourceBaseDAO<DashboardSalesProductDTO> implements
		AnySourceBaseDAO<DashboardSalesProductDTO> {

	private final SaleRepository saleRepository;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;


	@Override
	public String getId(final DashboardSalesProductDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final DashboardSalesProductDTO entity) {
		entity.setId(id);
	}

	@Override
	public DashboardSalesProductDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getStats(bc).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<DashboardSalesProductDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getStats(bc));
	}

	@Override
	public DashboardSalesProductDTO update(BusinessComponent bc, DashboardSalesProductDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public DashboardSalesProductDTO create(final BusinessComponent bbc, final DashboardSalesProductDTO entity) {
		throw new IllegalStateException();
	}

	@NonNull
	private List<DashboardSalesProductDTO> getStats(BusinessComponent bc) {
		List<DashboardSalesProductDTO> result = new ArrayList<>();
		List<Sale> sales;

		if (parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc) != null &&
				!parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc).getValues().isEmpty()) {
			Set<FieldOfActivity> filteredActivities = parentDtoFirstLevelCache.getParentField(
							DashboardFilterDTO_.fieldOfActivity,
							bc
					)
					.getValues().stream().map(v -> FieldOfActivity.getByValue(v.getValue())).collect(Collectors.toSet());
			sales = saleRepository.findAllByClientFieldOfActivitiesIn(filteredActivities);
		} else {
			sales = saleRepository.findAll();
		}

		Map<Client, Map<Product, LongSummaryStatistics>> salesSummary = sales.stream().filter(f -> f.getProduct() != null)
				.collect(Collectors.groupingBy(
						Sale::getClient,
						Collectors.groupingBy(Sale::getProduct, Collectors.summarizingLong(Sale::getSum))
				));
		final int[] nextId = {0};
		salesSummary.forEach((client, productStats) -> productStats.forEach((product, stats) -> {
			DashboardSalesProductDTO prod = new DashboardSalesProductDTO();
			prod.setClientName(client.getFullName());
			prod.setId(String.valueOf(nextId[0] + 1));
			nextId[0] = nextId[0] + 1;
			prod.setProductName(product.key());
			prod.setSum(stats.getSum());
			prod.setColor(Objects.equals(product.key(), Product.EXPERTISE.key()) ? "#4D83E7" : "#30BA8F");
			result.add(prod);
		}));
		return result;
	}


}
