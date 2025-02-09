package org.demo.conf.cxbox.customization.responsibilitiesAction.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ActionSuggestionAdminDTO;
import org.springframework.stereotype.Service;

@Getter
@RequiredArgsConstructor
@Service
public class ActionSuggestionAdminService extends AnySourceVersionAwareResponseService<ActionSuggestionAdminDTO, ActionSuggestionAdminDTO> {

	private final Class<ActionSuggestionAdminMeta> fieldMetaBuilder = ActionSuggestionAdminMeta.class;

	private final Class<ActionSuggestionAdminDao> anySourceBaseDAOClass = ActionSuggestionAdminDao.class;

	@Override
	protected CreateResult<ActionSuggestionAdminDTO> doCreateEntity(ActionSuggestionAdminDTO entity, BusinessComponent bc) {

		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<ActionSuggestionAdminDTO> doUpdateEntity(ActionSuggestionAdminDTO entity, ActionSuggestionAdminDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
