package org.demo.service.cxbox.inner;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.inner.ContactMultivalueDTO;
import org.demo.entity.Contact;
import org.springframework.stereotype.Service;

@SuppressWarnings("java:S1170")
@Service
@RequiredArgsConstructor
public class ContactMultivalueService extends VersionAwareResponseService<ContactMultivalueDTO, Contact> {

	@Getter(onMethod_ = @Override)
	private final Class<ContactMultivalueMeta> meta = ContactMultivalueMeta.class;

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