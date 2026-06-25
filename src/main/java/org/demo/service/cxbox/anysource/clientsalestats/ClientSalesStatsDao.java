package org.demo.service.cxbox.anysource.clientsalestats;

import static org.demo.service.cxbox.anysource.StatisticUtils.COLOR_LIST;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.BaseStatsDTO;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.ClientRepository;
import org.demo.service.cxbox.anysource.StatisticUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientSalesStatsDao extends AbstractAnySourceBaseDAO<BaseStatsDTO> implements
		AnySourceBaseDAO<BaseStatsDTO> {

	private final ClientRepository clientRepository;

	private final StatisticUtils statisticUtils;

	@Override
	public String getId(final BaseStatsDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final BaseStatsDTO entity) {
		entity.setId(id);
	}

	@Override
	public BaseStatsDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getClientStats(bc).stream()
				.filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<BaseStatsDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getClientStats(bc));
	}

	@Override
	public BaseStatsDTO update(BusinessComponent bc, BaseStatsDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public BaseStatsDTO create(final BusinessComponent bc, final BaseStatsDTO entity) {
		throw new IllegalStateException();
	}

	public List<BaseStatsDTO> getClientStats(BusinessComponent bc) {

		Set<FieldOfActivity> filter = statisticUtils.getFilteredActivities(bc);

		AtomicInteger num = new AtomicInteger(1);
		return clientRepository.countGroupedBySales(filter).stream()
				.map(stat -> {
					int index = num.getAndIncrement() % COLOR_LIST.size();
					if (index > 15) {
						index = 1;
					}
					return statisticUtils.createStatsDTO(
							stat.clientName(),
							stat.countSale(),
							COLOR_LIST.get(index),
							null,
							stat.clientId().toString(),
							"Press to filter List below"
					);
				})
				.toList();
	}

}