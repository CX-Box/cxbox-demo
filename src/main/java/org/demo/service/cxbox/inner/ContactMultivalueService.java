package org.demo.service.cxbox.inner;

import lombok.Getter;
import org.demo.dto.ContactMultivalueDTO;
import org.demo.entity.Contact;
import org.springframework.stereotype.Service;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;

@Getter
@Service
public class ContactMultivalueService extends VersionAwareResponseService<ContactMultivalueDTO, Contact> {

	public ContactMultivalueService() {
		super(ContactMultivalueDTO.class, Contact.class, null, ContactMultivalueMeta.class);
	}

	@Override
	protected CreateResult<ContactMultivalueDTO> doCreateEntity(org.demo.entity.Contact entity, BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<ContactMultivalueDTO> doUpdateEntity(org.demo.entity.Contact entity,
			ContactMultivalueDTO data, BusinessComponent bc) {
		return null;
	}


}