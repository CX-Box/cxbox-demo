package org.demo.service.cxbox.anysource.dadatacompany;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.CompanySuggestionDTO;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyMeta extends AnySourceFieldMetaBuilder<CompanySuggestionDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<CompanySuggestionDTO> fields, BcDescription bc,
			String id, String parentId) {

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<CompanySuggestionDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}
