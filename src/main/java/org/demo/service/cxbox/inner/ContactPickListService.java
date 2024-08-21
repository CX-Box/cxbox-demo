package org.demo.service.cxbox.inner;

import static org.cxbox.api.data.dao.SpecificationUtils.and;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.exception.BusinessException;
import org.cxbox.core.service.action.Actions;
import org.cxbox.model.core.entity.BaseEntity_;
import org.demo.conf.cxbox.extension.fulltextsearch.FullTextSearchExt;
import org.demo.dto.cxbox.inner.ContactDTO;
import org.demo.dto.cxbox.inner.ContactDTO_;
import org.demo.dto.cxbox.inner.MeetingDTO_;
import org.demo.entity.Client;
import org.demo.entity.Contact;
import org.demo.entity.Contact_;
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
		Specification<Contact> specification = (root, cq, cb) -> cb.and(
				super.getParentSpecification(bc).toPredicate(root, cq, cb),
				cb.equal(
						root.get(Contact_.client).get(BaseEntity_.id),
						clientId
				)
		);
		var fullTextSearchFilterParam = FullTextSearchExt.getFullTextSearchFilterParam(bc);
		return fullTextSearchFilterParam.map(e -> and(contactRepository.getFullTextSearchSpecification(e), specification))
				.orElse(specification);
	}

	@Override
	protected CreateResult<ContactDTO> doCreateEntity(Contact entity, BusinessComponent bc) {
		Long clientId = getParentField(MeetingDTO_.clientId, bc);
		Client client = clientRepository.getReferenceById(clientId);
		entity.setClient(client);
		contactRepository.save(entity);
		ContactDTO contactDTO = entityToDto(bc, entity);
		return new CreateResult<>(contactDTO);
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
