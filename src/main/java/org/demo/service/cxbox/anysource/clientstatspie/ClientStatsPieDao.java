package org.demo.service.cxbox.anysource.clientstatspie;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.dto.cxbox.anysource.ClientStatsDTO;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.enums.ClientStatus;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.ClientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientStatsPieDao extends AbstractAnySourceBaseDAO<ClientStatsDTO> implements
		AnySourceBaseDAO<ClientStatsDTO> {

	public static final int ROWS_TOTAL = 3;

	public static final String NEW_CLIENTS_ID = "0";

	public static final String INACTIVE_CLIENTS_ID = "1";

	public static final String IN_PROGRESS_CLIENTS = "2";

	private final ClientRepository clientRepository;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

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
		long statNewCount = 0;
		long statInactiveCount = 0;
		long statInProgressCount = 0;

		if (hasFilteredActivities(bc)) {
			Set<FieldOfActivity> filteredActivities = getFilteredActivities(bc);
			statNewCount = countClientsByStatus(filteredActivities, ClientStatus.NEW);
			statInactiveCount = countClientsByStatus(filteredActivities, ClientStatus.INACTIVE);
			statInProgressCount = countClientsByStatus(filteredActivities, ClientStatus.IN_PROGRESS);
		} else {
			statNewCount = countClientsByStatus(ClientStatus.NEW);
			statInactiveCount = countClientsByStatus(ClientStatus.INACTIVE);
			statInProgressCount = countClientsByStatus(ClientStatus.IN_PROGRESS);
		}

		return createClientStatsList(statNewCount, statInactiveCount, statInProgressCount);
	}

	private List<ClientStatsDTO> createClientStatsList(long newCount, long inactiveCount, long inProgressCount) {
		List<ClientStatsDTO> result = new ArrayList<>(ROWS_TOTAL);
		if (newCount != 0) {
			result.add(createClientStatsDTO(
					"New Clients",
					newCount,
					"#779FE9",
					"team",
					NEW_CLIENTS_ID,
					"New Clients. Press to filter List below"
			));
		}
		if (inactiveCount != 0) {
			result.add(createClientStatsDTO(
					"Inactive Clients",
					inactiveCount,
					"#5F90EA",
					"calendar",
					INACTIVE_CLIENTS_ID,
					"Inactive Clients. Press to filter List below"
			));
		}
		if (inProgressCount != 0) {
			result.add(createClientStatsDTO(
					"In Progress Clients",
					inProgressCount,
					"#4D83E7",
					"pie-chart",
					IN_PROGRESS_CLIENTS,
					"In Progress Clients. Press to filter List below"
			));
		}

		return result;
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

	private boolean hasFilteredActivities(BusinessComponent bc) {
		return parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc) != null &&
				!parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc).getValues().isEmpty();
	}

	private Set<FieldOfActivity> getFilteredActivities(BusinessComponent bc) {
		return parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc)
				.getValues().stream()
				.map(v -> FieldOfActivity.getByValue(v.getValue()))
				.collect(Collectors.toSet());
	}

	private long countClientsByStatus(Set<FieldOfActivity> activities, ClientStatus status) {
		return clientRepository.findAllByFieldOfActivitiesInAndStatusIn(activities, List.of(status)).size();
	}

	private long countClientsByStatus(ClientStatus status) {
		return clientRepository.count(clientRepository.statusIn(List.of(status)));
	}

}
