package org.demo.service.cxbox.anysource.saleproductstats;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDTO;
import org.demo.entity.dictionary.Product;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.SaleRepository;
import org.demo.service.cxbox.anysource.StatisticUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductDao extends AbstractAnySourceBaseDAO<DashboardSalesProductDTO> implements
		AnySourceBaseDAO<DashboardSalesProductDTO> {

	private final SaleRepository saleRepository;

	private final StatisticUtils statisticUtils;

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
		Set<FieldOfActivity> filter = statisticUtils.getFilteredActivities(bc);
		var salesStats = saleRepository.getSalesStatsByFieldOfActivity(filter);
		return salesStats.stream()
				.<DashboardSalesProductDTO>map(stat -> DashboardSalesProductDTO.builder()
						.id(stat.id())
						.clientName(stat.clientName())
						.productName((Product) stat.productName())
						.sum(stat.sum())
						.vstamp(0L)
						.color(Product.EXPERTISE.equals(stat.productName()) ? "#4D83E7" : "#30BA8F")
						.build())
				.toList();
	}


}
