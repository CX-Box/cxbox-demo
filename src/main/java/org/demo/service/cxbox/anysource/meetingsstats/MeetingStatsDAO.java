package org.demo.service.cxbox.anysource.meetingsstats;

import java.util.Arrays;
import java.util.Comparator;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.BaseStatsDTO;
import org.demo.entity.enums.MeetingStatus;
import org.demo.repository.MeetingRepository;
import org.demo.service.cxbox.anysource.StatisticUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingStatsDAO extends AbstractAnySourceBaseDAO<BaseStatsDTO> {

	public static final String ALL = "1";

	public static final String COLOR = "#5F90EA";

	private final MeetingRepository meetingRepository;

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
		return getMeetingStatistics().stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<BaseStatsDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getMeetingStatistics());
	}

	@Override
	public BaseStatsDTO update(BusinessComponent bc, BaseStatsDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public BaseStatsDTO create(final BusinessComponent bc, final BaseStatsDTO entity) {
		throw new IllegalStateException();
	}

	public List<BaseStatsDTO> getMeetingStatistics() {

		Map<MeetingStatus, Long> stats =
				StatisticUtils.toEnumCountMap(
						meetingRepository.countGroupedByStatus(),
						MeetingStatus.class
				);

		return Stream.concat(
						Arrays.stream(MeetingStatus.values())
								.map(status -> statisticUtils.createStatsDTO(
										status.getValue(),
										stats.getOrDefault(status, 0L),
										COLOR,
										status.getIcon(),
										status.getId(),
										"Meetings " + status.getValue()
								)),
						Stream.of(buildAllMeetings(stats))
				)
				.sorted(Comparator.comparing(BaseStatsDTO::getId))
				.toList();
	}

	private BaseStatsDTO buildAllMeetings(Map<MeetingStatus, Long> stats) {

		BaseStatsDTO meetingStatsDTO = new BaseStatsDTO();
		meetingStatsDTO
				.setTitle("All Meetings")
				.setValue(stats.values().stream()
						.mapToLong(Long::longValue)
						.sum())
				.setColor(COLOR)
				.setIcon("team")
				.setDescription("All meetings")
				.setId(ALL);
		return meetingStatsDTO;
	}


}