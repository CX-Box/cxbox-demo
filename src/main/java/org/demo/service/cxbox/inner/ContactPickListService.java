package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.action.Actions;
import org.cxbox.model.core.entity.BaseEntity_;
import org.demo.dto.cxbox.inner.ContactDTO;
import org.demo.dto.cxbox.inner.ContactDTO_;
import org.demo.entity.Client;
import org.demo.entity.Contact;
import org.demo.entity.Contact_;
import org.demo.entity.Meeting;
import org.demo.repository.ClientRepository;
import org.demo.repository.ContactRepository;
import org.demo.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class ContactPickListService extends VersionAwareResponseService<ContactDTO, Contact> {

	@Autowired
	private MeetingRepository meetingRepository;

	@Autowired
	private ClientRepository clientRepository;

	@Autowired
	private ContactRepository contactRepository;

	public ContactPickListService() {
		super(ContactDTO.class, Contact.class, null, ContactPickListMeta.class);
	}

	@Override
	protected Specification<Contact> getParentSpecification(BusinessComponent bc) {
		Meeting meeting = meetingRepository.getById(bc.getParentIdAsLong());
		return (root, cq, cb) -> cb.and(
				super.getParentSpecification(bc).toPredicate(root, cq, cb),
				cb.equal(
						root.get(Contact_.client).get(BaseEntity_.id),
						meeting.getClient() != null ? meeting.getClient().getId() : null
				)
		);
	}

	@Override
	protected CreateResult<ContactDTO> doCreateEntity(Contact entity, BusinessComponent bc) {
		Client client = clientRepository.findById(bc.getParentIdAsLong()).orElse(null);
		entity.setClient(client);
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
	public Actions<ContactDTO> getActions() {
		return Actions.<ContactDTO>builder()
				.create().text("Add").add()
				.save().text("Save").add()
				.cancelCreate().text("Cancel").available(bc -> true).add()
				.build();
	}

}
