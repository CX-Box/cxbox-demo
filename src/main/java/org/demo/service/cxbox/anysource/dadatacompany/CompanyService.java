package org.demo.service.cxbox.anysource.dadatacompany;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.CompanySuggestionDTO;
import org.springframework.stereotype.Service;

@Service
public class CompanyService extends AnySourceVersionAwareResponseService<CompanySuggestionDTO, CompanySuggestionDTO> {

	public CompanyService() {
		super(CompanySuggestionDTO.class, CompanySuggestionDTO.class, CompanyMeta.class, CompanyDAO.class);
	}

	@Override
	protected CreateResult<CompanySuggestionDTO> doCreateEntity(CompanySuggestionDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<CompanySuggestionDTO> doUpdateEntity(CompanySuggestionDTO entity, CompanySuggestionDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
