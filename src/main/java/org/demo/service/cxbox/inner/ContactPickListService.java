package org.demo.service.cxbox.inner;

import static org.cxbox.api.data.dao.SpecificationUtils.and;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.exception.BusinessException;
import org.cxbox.core.service.action.Actions;
import org.demo.conf.cxbox.extension.fulltextsearch.FullTextSearchExt;
import org.demo.dto.cxbox.inner.ContactDTO;
import org.demo.dto.cxbox.inner.ContactDTO_;
import org.demo.dto.cxbox.inner.MeetingDTO_;
import org.demo.entity.Contact;
import org.demo.repository.ClientRepository;
import org.demo.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ContactPickListService extends VersionAwareResponseService<ContactDTO, Contact> {

	@Autowired
	private ClientRepository clientRepository;

	@Autowired
	private ContactRepository contactRepository;

	public ContactPickListService() {
		super(ContactDTO.class, Contact.class, null, ContactPickListMeta.class);
	}

	@Override
	protected Specification<Contact> getParentSpecification(BusinessComponent bc) {
		Long clientId = getParentField(MeetingDTO_.clientId, bc);
		var specification = contactRepository.getAllClientContacts(clientId);
		var fullTextSearchFilterParam = FullTextSearchExt.getFullTextSearchFilterParam(bc);
		return fullTextSearchFilterParam.map(e -> and(contactRepository.getFullTextSearchSpecification(e), specification))
				.orElse(specification);
	}

	@Override
	protected CreateResult<ContactDTO> doCreateEntity(Contact entity, BusinessComponent bc) {
		Long clientId = getParentField(MeetingDTO_.clientId, bc);
		if (clientId != null) {
			entity.getClients().add(clientRepository.getReferenceById(clientId));
		}
		contactRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<ContactDTO> doUpdateEntity(Contact entity, ContactDTO data,
			BusinessComponent bc) {
		setIfChanged(data, ContactDTO_.fullName, entity::setFullName);
		setIfChanged(data, ContactDTO_.email, entity::setEmail);
		setIfChanged(data, ContactDTO_.phoneNumber, entity::setPhoneNumber);
		contactRepository.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public ActionResultDTO<ContactDTO> deleteEntity(BusinessComponent bc) {
		ActionResultDTO<ContactDTO> contactDTOActionResultDTO;
		try {
			contactDTOActionResultDTO = super.deleteEntity(bc);
			contactRepository.flush();
		} catch (DataIntegrityViolationException e) {
			throw new BusinessException(e).addPopup("You are trying to delete row, that is referenced from other place in system. Deletion is not available");
		}
		return contactDTOActionResultDTO;
	}

	@Override
	public Actions<ContactDTO> getActions() {
		return Actions.<ContactDTO>builder()
				.create().text("Add").add()
				.save().text("Save").add()
				.cancelCreate().text("Cancel").available(bc -> true).add()
				.delete().text("Delete").add()
				.build();
	}

}
