package org.demo.service.cxbox.external.dadatacompany;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.ExternalVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.CompanySuggestionDTO;
import org.springframework.stereotype.Service;

@Service
public class CompanyReadService extends ExternalVersionAwareResponseService<CompanySuggestionDTO, CompanySuggestionDTO> {

	public CompanyReadService() {
		super(CompanySuggestionDTO.class, CompanySuggestionDTO.class, CompanyReadMeta.class, CompanyDAO.class);
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
