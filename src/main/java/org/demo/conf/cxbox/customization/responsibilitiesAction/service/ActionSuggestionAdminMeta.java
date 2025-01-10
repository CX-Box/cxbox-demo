package org.demo.conf.cxbox.customization.responsibilitiesAction.service;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ActionSuggestionAdminDTO;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActionSuggestionAdminMeta extends AnySourceFieldMetaBuilder<ActionSuggestionAdminDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ActionSuggestionAdminDTO> fields, BcDescription bc,
			String id, String parentId) {

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ActionSuggestionAdminDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}
