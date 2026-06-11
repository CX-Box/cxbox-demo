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
public class ClientStatsCount   {


	private final ClientRepository clientRepository;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

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
