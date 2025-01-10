package org.demo.conf.cxbox.customization.responsibilitiesAction.service;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ActionSuggestionAdminDTO;
import org.springframework.stereotype.Service;

@Service
public class ActionSuggestionAdminService extends AnySourceVersionAwareResponseService<ActionSuggestionAdminDTO, ActionSuggestionAdminDTO> {

	public ActionSuggestionAdminService() {
		super(ActionSuggestionAdminDTO.class, ActionSuggestionAdminDTO.class, ActionSuggestionAdminMeta.class, ActionSuggestionAdminDao.class);
	}

	@Override
	protected CreateResult<ActionSuggestionAdminDTO> doCreateEntity(ActionSuggestionAdminDTO entity, BusinessComponent bc) {

		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<ActionSuggestionAdminDTO> doUpdateEntity(ActionSuggestionAdminDTO entity, ActionSuggestionAdminDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
