package org.demo.service.cxbox.inner;


import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.Actions;
import org.demo.dto.cxbox.inner.MeetingDTO;
import org.demo.entity.Meeting;
import org.demo.repository.MeetingRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@Getter
@RequiredArgsConstructor
public class CalendarService extends VersionAwareResponseService<MeetingDTO, Meeting> {

	@Getter(onMethod_ = @Override)
	private final Class<CalendarViewMetaBuilder> meta = CalendarViewMetaBuilder.class;

	private final MeetingRepository meetingRepository;


	@Override
	protected Specification<Meeting> getSpecification(BusinessComponent bc) {
		return super.getSpecification(bc);
	}

	@Override
	protected CreateResult<MeetingDTO> doCreateEntity(Meeting entity, BusinessComponent bc) {
		return new CreateResult<>(entityToDto(bc, meetingRepository.save(entity)));
	}

	@Override
	protected ActionResultDTO<MeetingDTO> doUpdateEntity(Meeting entity, MeetingDTO data, BusinessComponent bc) {
		return new ActionResultDTO<>(entityToDto(bc, meetingRepository.save(entity)))
				.setAction(PostAction.refreshBc(bc));
	}

	@Override
	public Actions<MeetingDTO> getActions() {
		return Actions.<MeetingDTO>builder()
				.create(crt -> crt.text("Create"))
				.delete(dlt -> dlt.text("Delete"))
				.save(sv -> sv.text("Save"))
				.build();
	}

}
