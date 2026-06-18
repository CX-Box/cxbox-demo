package org.demo.service.cxbox.anysource;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.enums.ClientStatus;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.ClientRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatisticUtils {


	private final ClientRepository clientRepository;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;


	public boolean hasFilteredActivities(BusinessComponent bc) {
		return parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc) != null &&
				!parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc).getValues().isEmpty();
	}

	public Set<FieldOfActivity> getFilteredActivities(BusinessComponent bc) {
		return parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc)
				.getValues().stream()
				.map(v -> FieldOfActivity.getByValue(v.getValue()))
				.collect(Collectors.toSet());
	}

	public long countClientsByStatus(Set<FieldOfActivity> activities, ClientStatus status) {
		return clientRepository.findAllByFieldOfActivitiesInAndStatusIn(activities, List.of(status)).size();
	}

	public long countClientsByStatus(ClientStatus status) {
		return clientRepository.count(clientRepository.statusIn(List.of(status)));
	}

	public LocalDate firstDay(Integer month, Integer year) {
		return (month == null || year == null) ? null : LocalDate.of(year, month, 1);
	}

	public LocalDate lastDay(Integer month, Integer year) {
		return (month == null || year == null) ? null
				: LocalDate.of(year, month, 1).withDayOfMonth(LocalDate.of(year, month, 1).lengthOfMonth());
	}

}
