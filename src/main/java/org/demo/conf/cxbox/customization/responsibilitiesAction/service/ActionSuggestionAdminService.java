package org.demo.conf.cxbox.customization.responsibilitiesAction.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ActionSuggestionAdminDTO;
import org.springframework.stereotype.Service;

@Getter
@Service
@RequiredArgsConstructor
public class ActionSuggestionAdminService extends
		AnySourceVersionAwareResponseService<ActionSuggestionAdminDTO, ActionSuggestionAdminDTO> {

	private final Class<? extends AnySourceFieldMetaBuilder<ActionSuggestionAdminDTO>> metaBuilder = ActionSuggestionAdminMeta.class;

	private final Class<? extends AnySourceBaseDAO<ActionSuggestionAdminDTO>> anySourceBaseDAOClass = ActionSuggestionAdminDao.class;

	@Override
	protected CreateResult<ActionSuggestionAdminDTO> doCreateEntity(ActionSuggestionAdminDTO entity,
			BusinessComponent bc) {

		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<ActionSuggestionAdminDTO> doUpdateEntity(ActionSuggestionAdminDTO entity,
			ActionSuggestionAdminDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
