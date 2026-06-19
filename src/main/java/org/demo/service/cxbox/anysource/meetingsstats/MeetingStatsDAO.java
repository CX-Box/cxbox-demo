package org.demo.service.cxbox.anysource.meetingsstats;

import java.util.Arrays;
import java.util.Comparator;
import java.util.Objects;
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

	public static final String ALL = "1";

	public static final String COLOR = "#5F90EA";

	private final MeetingRepository meetingRepository;

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
		List<MeetingStatsDTO> list = new java.util.ArrayList<>(Arrays.stream(MeetingStatus.values())
				.map(status -> createMeetingStatsDTO(
						status.getValue(),
						meetingRepository.findByStatus(status).size(),
						COLOR,
						status.getIcon(),
						status.getId(),
						"Meetings " + status.getValue()
				))
				.filter(dto -> dto.getValue() != 0)
				.toList());
		list.add(createMeetingStatsDTO("All Meetings", allCount, COLOR, "team", ALL, "All meetings"));
		list.sort(Comparator.comparing(MeetingStatsDTO::getId));
		return list;
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