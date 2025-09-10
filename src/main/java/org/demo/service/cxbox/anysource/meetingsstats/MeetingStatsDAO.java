package org.demo.service.cxbox.anysource.meetingsstats;

import java.util.Objects;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.MeetingStatsDTO;
import org.demo.entity.enums.MeetingStatus;
import org.demo.repository.MeetingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingStatsDAO extends AbstractAnySourceBaseDAO<MeetingStatsDTO> {

	private final MeetingRepository meetingRepository;

	public static final String ALL = "1";

	public static final String NOT_STARTED = "2";

	public static final String IN_COMPLETION = "3";

	public static final String IN_PROGRESS = "4";

	public static final String COMPLETED = "5";

	public static final String CANCELLED = "6";

	@Override
	public String getId(final MeetingStatsDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final MeetingStatsDTO entity) {
		entity.setId(id);
	}

	@Override
	public MeetingStatsDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getMeetingStatistics().stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<MeetingStatsDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getMeetingStatistics());
	}

	@Override
	public MeetingStatsDTO update(BusinessComponent bc, MeetingStatsDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public MeetingStatsDTO create(final BusinessComponent bc, final MeetingStatsDTO entity) {
		throw new IllegalStateException();
	}

	public List<MeetingStatsDTO> getMeetingStatistics() {
		long allCount = meetingRepository.count();
		long notStartedCount = countByStatus(MeetingStatus.NOT_STARTED);
		long inCompletionCount = countByStatus(MeetingStatus.IN_COMPLETION);
		long inProgressCount = countByStatus(MeetingStatus.IN_PROGRESS);
		long completedCount = countByStatus(MeetingStatus.COMPLETED);
		long cancelledCount = countByStatus(MeetingStatus.CANCELLED);

		return createMeetingStatsList(
				allCount, notStartedCount, inCompletionCount,
				inProgressCount, completedCount, cancelledCount
		);
	}

	private long countByStatus(MeetingStatus status) {
		return meetingRepository.findByStatus(status).size();
	}

	private List<MeetingStatsDTO> createMeetingStatsList(
			long allCount, long notStartedCount, long inCompletionCount,
			long inProgressCount, long completedCount, long cancelledCount) {

		return Stream.of(
						createMeetingStatsDTO("All Meetings", allCount, "#779FE9", "team", ALL, "All meetings"),
						createMeetingStatsDTO(
								"Not Started",
								notStartedCount,
								"#5F90EA",
								"calendar",
								NOT_STARTED,
								"Not started meetings"
						),
						createMeetingStatsDTO(
								"In Completion",
								inCompletionCount,
								"#4D83E7",
								"pie-chart",
								IN_COMPLETION,
								"Meetings in completion"
						),
						createMeetingStatsDTO("In Progress", inProgressCount, "#3A76E4", "plus-circle", IN_PROGRESS, "Meetings in progress"),
						createMeetingStatsDTO("Completed", completedCount, "#2769E1", "check", COMPLETED, "Completed meetings"),
						createMeetingStatsDTO("Cancelled", cancelledCount, "#145CDE", "stop", CANCELLED, "Cancelled meetings")
				)
				.filter(dto -> dto.getValue() > 0)
				.toList();
	}

	private MeetingStatsDTO createMeetingStatsDTO(String title, long value, String color,
			String icon, String id, String description) {
		MeetingStatsDTO meetingStatsDTO = new MeetingStatsDTO();
		meetingStatsDTO
				.setTitle(title)
				.setValue(value)
				.setColor(color)
				.setIcon(icon)
				.setDescription(description)
				.setId(id);
		return meetingStatsDTO;
	}

}