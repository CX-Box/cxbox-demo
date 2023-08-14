package org.demo.service;

import lombok.Getter;
import org.springframework.stereotype.Service;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;


@Getter
@Service
public class ContactMultivalueService extends
		VersionAwareResponseService<org.demo.dto.ContactMultivalueDTO, org.demo.entity.Contact> {

	public ContactMultivalueService() {
		super(org.demo.dto.ContactMultivalueDTO.class, org.demo.entity.Contact.class, null, ContactMultivalueMeta.class);
	}

	@Override
	protected CreateResult<org.demo.dto.ContactMultivalueDTO> doCreateEntity(org.demo.entity.Contact entity,
			BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<org.demo.dto.ContactMultivalueDTO> doUpdateEntity(org.demo.entity.Contact entity,
			org.demo.dto.ContactMultivalueDTO data,
			BusinessComponent bc) {
		return null;
	}


}