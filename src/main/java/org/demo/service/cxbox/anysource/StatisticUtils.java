package org.demo.service.cxbox.anysource;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.dto.cxbox.anysource.BaseStatsDTO;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.enums.FieldOfActivity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatisticUtils {

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	public static <E extends Enum<E>> Map<E, Long> toEnumCountMap(List<Object[]> rows, Class<E> enumClass) {
		return rows.stream()
				.collect(Collectors.toMap(
						row -> enumClass.cast(row[0]),
						row -> (Long) row[1]
				));
	}

	public Set<FieldOfActivity> getFilteredActivities(BusinessComponent bc) {
		return hasFilteredActivities(bc) ? parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc)
				.getValues().stream()
				.map(v -> FieldOfActivity.getByValue(v.getValue()))
				.collect(Collectors.toSet())
				: null;
	}

	private boolean hasFilteredActivities(BusinessComponent bc) {
		return parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc) != null &&
				!parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc).getValues().isEmpty();
	}

	public LocalDate firstDay(Integer month, Integer year) {
		return (month == null || year == null) ? null : LocalDate.of(year, month, 1);
	}

	public LocalDate lastDay(Integer month, Integer year) {
		return (month == null || year == null) ? null
				: LocalDate.of(year, month, 1).withDayOfMonth(LocalDate.of(year, month, 1).lengthOfMonth());
	}

	public BaseStatsDTO createStatsDTO(
			String title,
			Object value,
			String color,
			String icon,
			String id,
			String description
	) {
		BaseStatsDTO baseStatsDTO = new BaseStatsDTO()
				.setTitle(title)
				.setValue(value)
				.setColor(color)
				.setIcon(icon)
				.setDescription(description);
		baseStatsDTO.setId(id);
		return baseStatsDTO;
	}

}
