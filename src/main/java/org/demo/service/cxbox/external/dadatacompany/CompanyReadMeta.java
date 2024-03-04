package org.demo.service.cxbox.external.dadatacompany;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.ExternalFieldMetaBuilder;
import org.demo.dto.CompanySuggestionDTO;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyReadMeta extends ExternalFieldMetaBuilder<CompanySuggestionDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<CompanySuggestionDTO> fields, BcDescription bc,
			String id, String parentId) {

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<CompanySuggestionDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}
