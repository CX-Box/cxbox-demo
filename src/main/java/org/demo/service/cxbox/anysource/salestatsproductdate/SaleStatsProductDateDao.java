package org.demo.service.cxbox.anysource.salestatsproductdate;


import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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
import org.demo.dto.cxbox.anysource.DashboardSalesProductDateDTO;
import org.demo.entity.Sale;
import org.demo.entity.enums.SaleStatus;
import org.demo.repository.DashboardFilterRepository;
import org.demo.repository.SaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductDateDao extends AbstractAnySourceBaseDAO<DashboardSalesProductDateDTO> implements
		AnySourceBaseDAO<DashboardSalesProductDateDTO> {

	private final DashboardFilterRepository dashboardFilterRepository;

	private final SaleRepository saleRepository;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;


	@Override
	public String getId(final DashboardSalesProductDateDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final DashboardSalesProductDateDTO entity) {
		entity.setId(id);
	}

	@Override
	public DashboardSalesProductDateDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getStats(bc).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<DashboardSalesProductDateDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getStats(bc));
	}

	@Override
	public DashboardSalesProductDateDTO update(BusinessComponent bc, DashboardSalesProductDateDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public DashboardSalesProductDateDTO create(final BusinessComponent bbc, final DashboardSalesProductDateDTO entity) {
		throw new IllegalStateException();
	}

	@NonNull
	private List<DashboardSalesProductDateDTO> getStats(BusinessComponent bc) {
		List<DashboardSalesProductDateDTO> result = new ArrayList<>();
		List<Sale> sales = saleRepository.findAllByStatusIn(List.of(SaleStatus.OPEN, SaleStatus.CLOSED));

		Map<String, Map<SaleStatus, Long>> salesSummary = sales.stream().filter(f -> f.getDateCreatedSales() != null)
				.collect(Collectors.groupingBy(
						s -> DateTimeFormatter.ofPattern("MMMM/yyyy", Locale.ENGLISH).format(s.getDateCreatedSales()),
						Collectors.groupingBy(Sale::getStatus, Collectors.counting())
				));

		final int[] nextId = {0};
		salesSummary.forEach((dateCreated, productStats) -> productStats.forEach((saleStatus, stats) -> {
			DashboardSalesProductDateDTO prod = new DashboardSalesProductDateDTO();
			prod.setCount(stats);
			prod.setId(String.valueOf(nextId[0] + 1));
			nextId[0] = nextId[0] + 1;
			prod.setDateCreatedSales(dateCreated);
			prod.setSaleStatus(saleStatus);
			result.add(prod);
		}));
		return result;
	}


}
