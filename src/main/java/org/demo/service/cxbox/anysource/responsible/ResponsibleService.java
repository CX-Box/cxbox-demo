package org.demo.service.cxbox.anysource.responsible;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.Actions;
import org.demo.dto.cxbox.anysource.ResponsibleDTO;
import org.springframework.stereotype.Service;


@Getter
@Service
@RequiredArgsConstructor
public class ResponsibleService extends AnySourceVersionAwareResponseService<ResponsibleDTO, ResponsibleDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<ResponsibleMetaBuilder> meta = ResponsibleMetaBuilder.class;

	@Getter(onMethod_ = @Override)
	private final Class<ResponsibleDAO> dao = ResponsibleDAO.class;

	@Override
	protected CreateResult<ResponsibleDTO> doCreateEntity(ResponsibleDTO entity, BusinessComponent bc) {
		return new CreateResult<>(entityToDto(bc, getBaseDao().create(bc, entity)))
				.setAction(PostAction.refreshBc(bc));
	}

	@Override
	protected ActionResultDTO<ResponsibleDTO> doUpdateEntity(ResponsibleDTO entity, ResponsibleDTO data,
			BusinessComponent bc) {
		return new ActionResultDTO<>(entityToDto(bc, getBaseDao().update(bc, entity)))
				.setAction(PostAction.refreshBc(bc));
	}

	@Override
	public Actions<ResponsibleDTO> getActions() {
		return Actions.<ResponsibleDTO>builder()
				.create(crt -> crt.text("Create"))
				.delete(dlt -> dlt.text("Delete"))
				.save(sv -> sv.text("Save"))
				.build();
	}

}