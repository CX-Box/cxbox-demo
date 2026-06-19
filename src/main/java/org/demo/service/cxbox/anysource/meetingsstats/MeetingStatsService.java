package org.demo.service.cxbox.anysource.meetingsstats;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.Actions;
import org.demo.dto.cxbox.anysource.BaseStatsDTO;
import org.springframework.stereotype.Service;


@Getter
@Service
@RequiredArgsConstructor
public class MeetingStatsService extends AnySourceVersionAwareResponseService<BaseStatsDTO, BaseStatsDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<MeetingStatsMetaBuilder> meta = MeetingStatsMetaBuilder.class;

	@Getter(onMethod_ = @Override)
	private final Class<MeetingStatsDAO> dao = MeetingStatsDAO.class;

	@Override
	protected CreateResult<BaseStatsDTO> doCreateEntity(BaseStatsDTO entity, BusinessComponent bc) {
		return new CreateResult<>(entityToDto(bc, getBaseDao().create(bc, entity)))
				.setAction(PostAction.refreshBc(bc));
	}

	@Override
	protected ActionResultDTO<BaseStatsDTO> doUpdateEntity(BaseStatsDTO entity, BaseStatsDTO data,
			BusinessComponent bc) {
		return new ActionResultDTO<>(entityToDto(bc, getBaseDao().create(bc, entity)))
				.setAction(PostAction.refreshBc(bc));
	}

	@Override
	public Actions<BaseStatsDTO> getActions() {
		return Actions.<BaseStatsDTO>builder()
				.create(crt -> crt.text("Create"))
				.delete(dlt -> dlt.text("Delete"))
				.save(sv -> sv.text("Save"))
				.build();
	}

}