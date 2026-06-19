package org.demo.service.cxbox.anysource.clientstats;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.BaseStatsDTO;
import org.demo.entity.enums.ClientStatus;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.ClientRepository;
import org.demo.service.cxbox.anysource.StatisticUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientStatsDao extends AbstractAnySourceBaseDAO<BaseStatsDTO> implements
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

		Set<FieldOfActivity> filter = null;
		if (bc.getName().equals(CxboxRestController.dashboardClientStats.getName())) {
			filter = statisticUtils.getFilteredActivities(bc);
		}

		Map<ClientStatus, Long> stats = filter != null
				? StatisticUtils.toEnumCountMap(
				clientRepository.countGroupedByStatus(filter),
				ClientStatus.class
		)
				: StatisticUtils.toEnumCountMap(
						clientRepository.countGroupedByStatus(),
						ClientStatus.class
				);

		return Arrays.stream(ClientStatus.values())
				.map(status -> statisticUtils.createStatsDTO(
						status.getValue(),
						stats.getOrDefault(status, 0L),
						status.getColor(),
						status.getIcon(),
						status.getId(),
						status.getValue() + ". Press to filter List below"
				))
				.toList();

	}

}