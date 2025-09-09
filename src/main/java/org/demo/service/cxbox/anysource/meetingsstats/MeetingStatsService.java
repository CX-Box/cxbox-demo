package org.demo.service.cxbox.anysource.meetingsstats;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.Actions;
import org.demo.dto.cxbox.anysource.MeetingStatsDTO;
import org.springframework.stereotype.Service;


@Getter
@Service
@RequiredArgsConstructor
public class MeetingStatsService extends AnySourceVersionAwareResponseService<MeetingStatsDTO, MeetingStatsDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<MeetingStatsMetaBuilder> meta = MeetingStatsMetaBuilder.class;

	@Getter(onMethod_ = @Override)
	private final Class<MeetingStatsDAO> dao = MeetingStatsDAO.class;

	@Override
	protected CreateResult<MeetingStatsDTO> doCreateEntity(MeetingStatsDTO entity, BusinessComponent bc) {
		return new CreateResult<>(entityToDto(bc, getBaseDao().create(bc, entity)))
				.setAction(PostAction.refreshBc(bc));
	}

	@Override
	protected ActionResultDTO<MeetingStatsDTO> doUpdateEntity(MeetingStatsDTO entity, MeetingStatsDTO data,
			BusinessComponent bc) {
		return new ActionResultDTO<>(entityToDto(bc, getBaseDao().create(bc, entity)))
				.setAction(PostAction.refreshBc(bc));
	}

	@Override
	public Actions<MeetingStatsDTO> getActions() {
		return Actions.<MeetingStatsDTO>builder()
				.create(crt -> crt.text("Create"))
				.delete(dlt -> dlt.text("Delete"))
				.save(sv -> sv.text("Save"))
				.build();
	}

}