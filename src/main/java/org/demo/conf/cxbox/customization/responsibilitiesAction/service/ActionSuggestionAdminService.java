package org.demo.conf.cxbox.customization.responsibilitiesAction.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ActionSuggestionAdminDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class ActionSuggestionAdminService extends AnySourceVersionAwareResponseService<ActionSuggestionAdminDTO, ActionSuggestionAdminDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<ActionSuggestionAdminMeta> meta = ActionSuggestionAdminMeta.class;

	@Getter(onMethod_ = @Override)
	private final Class<ActionSuggestionAdminDao> dao = ActionSuggestionAdminDao.class;

	@Override
	protected CreateResult<ActionSuggestionAdminDTO> doCreateEntity(ActionSuggestionAdminDTO entity, BusinessComponent bc) {

		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<ActionSuggestionAdminDTO> doUpdateEntity(ActionSuggestionAdminDTO entity, ActionSuggestionAdminDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
