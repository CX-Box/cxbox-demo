package org.demo.service.cxbox.anysource.clientstatspie;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.ClientStatsDTO;
import org.demo.entity.enums.ClientStatus;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.service.cxbox.anysource.StatisticUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientStatsPieDao extends AbstractAnySourceBaseDAO<ClientStatsDTO> implements
		AnySourceBaseDAO<ClientStatsDTO> {

	private final StatisticUtils statisticUtils;

	@Override
	public String getId(final ClientStatsDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final ClientStatsDTO entity) {
		entity.setId(id);
	}

	@Override
	public ClientStatsDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getClientStatistics(bc).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<ClientStatsDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getClientStatistics(bc));
	}

	@Override
	public ClientStatsDTO update(BusinessComponent bc, ClientStatsDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public ClientStatsDTO create(final BusinessComponent bc, final ClientStatsDTO entity) {
		throw new IllegalStateException();
	}

	public List<ClientStatsDTO> getClientStatistics(BusinessComponent bc) {
		return Arrays.stream(ClientStatus.values())
				.map(status -> createClientStatsDTO(
						status.getValue(),
						countClientStats(bc, status),
						status.getColor(),
						status.getIcon(),
						status.getId(),
						status.getValue() + ". Press to filter List below"
				))
				.filter(dto -> dto.getValue() != 0)
				.toList();
	}

	private long countClientStats(BusinessComponent bc, ClientStatus status) {
		if (statisticUtils.hasFilteredActivities(bc)) {
			Set<FieldOfActivity> filteredActivities = statisticUtils.getFilteredActivities(bc);
			return statisticUtils.countClientsByStatus(filteredActivities, status);
		}
		return statisticUtils.countClientsByStatus(status);
	}

	private ClientStatsDTO createClientStatsDTO(String title, long value, String color, String icon, String id,
			String description) {
		ClientStatsDTO clientStatsDTO = new ClientStatsDTO();
		clientStatsDTO.setTitle(title)
				.setValue(value)
				.setColor(color)
				.setIcon(icon)
				.setDescription(description)
				.setId(id);
		return clientStatsDTO;
	}

}
