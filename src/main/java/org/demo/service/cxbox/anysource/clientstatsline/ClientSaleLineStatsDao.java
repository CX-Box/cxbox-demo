package org.demo.service.cxbox.anysource.clientstatsline;

import static org.demo.dto.cxbox.anysource.ClientSaleLineDTO.monthYearString;
import static org.demo.service.cxbox.anysource.StatisticUtils.COLOR_LIST;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.ClientSaleLineDTO;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.SaleRepository;
import org.demo.service.cxbox.anysource.StatisticUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientSaleLineStatsDao extends AbstractAnySourceBaseDAO<ClientSaleLineDTO> implements
		AnySourceBaseDAO<ClientSaleLineDTO> {

	private final SaleRepository saleRepository;

	private final StatisticUtils statisticUtils;

	@Override
	public String getId(final ClientSaleLineDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final ClientSaleLineDTO entity) {
		entity.setId(id);
	}

	@Override
	public ClientSaleLineDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getStats(bc).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<ClientSaleLineDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getStats(bc));
	}

	@Override
	public ClientSaleLineDTO update(BusinessComponent bc, ClientSaleLineDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public ClientSaleLineDTO create(final BusinessComponent bbc, final ClientSaleLineDTO entity) {
		throw new IllegalStateException();
	}

	@NonNull
	private List<ClientSaleLineDTO> getStats(BusinessComponent bc) {
		Set<FieldOfActivity> filter = statisticUtils.getFilteredActivities(bc);
		AtomicInteger num = new AtomicInteger(1);
		return saleRepository.getSalesStatsByMonthAndClient(filter).stream()
				.<ClientSaleLineDTO>map(stat -> {
					int index = num.getAndIncrement() % COLOR_LIST.size();
					if (index > 15) {
						index = 1;
					}
					return ClientSaleLineDTO.builder()
							.id(stat.id())
							.month(stat.month())
							.year(stat.year())
							.sum(stat.sum())
							.dateSales(monthYearString(stat.month(), stat.year()))
							.fullName(stat.fullName())
							.color(COLOR_LIST.get(index))
							.vstamp(0L)
							.build();
				})
				.toList();
	}

}
