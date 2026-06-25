package org.demo.service.cxbox.anysource;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.dto.cxbox.anysource.BaseStatsDTO;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.enums.FieldOfActivity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatisticUtils {

	public static final Map<Number, String> COLOR_LIST = Map.ofEntries(
			Map.entry(1, "#5689e8"),
			Map.entry(2, "#e856d2"),
			Map.entry(3, "#e8b556"),
			Map.entry(4, "#56e86c"),
			Map.entry(5, "#89e856"),
			Map.entry(6, "#e85689"),

			Map.entry(7, "#3dbe95"),
			Map.entry(8, "#553dbe"),
			Map.entry(9, "#be3d66"),
			Map.entry(10, "#a6be3d"),
			Map.entry(11, "#be953d"),
			Map.entry(12, "#953dbe"),

			Map.entry(13, "#5689e8"),
			Map.entry(14, "#e856d2"),
			Map.entry(15, "#e8b556")
	);

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	public static <E extends Enum<E>> Map<E, Long> toEnumCountMap(List<Object[]> rows, Class<E> enumClass) {
		return rows.stream()
				.collect(Collectors.toMap(
						row -> enumClass.cast(row[0]),
						row -> (Long) row[1]
				));
	}

	public MultivalueField getMultivalueFieldSingleValues(BusinessComponent bc) {
		return parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc);
	}

	public Set<FieldOfActivity> getFilteredActivities(BusinessComponent bc) {
		return hasFilteredActivities(bc) ? getMultivalueFieldSingleValues(bc)
				.getValues().stream()
				.map(v -> FieldOfActivity.getByValue(v.getValue()))
				.collect(Collectors.toSet())
				: null;
	}

	private boolean hasFilteredActivities(BusinessComponent bc) {
		return getMultivalueFieldSingleValues(bc) != null &&
				!getMultivalueFieldSingleValues(bc).getValues().isEmpty();
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
