package org.demo.service;

import org.demo.dto.ContactDTO;
import org.demo.entity.Contact;
import org.demo.entity.Contact_;
import org.demo.entity.Meeting;
import org.demo.repository.MeetingRepository;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.model.core.entity.BaseEntity_;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class ContactPickListService extends VersionAwareResponseService<ContactDTO, Contact> {

	private final MeetingRepository meetingRepository;

	public ContactPickListService(MeetingRepository meetingRepository) {
		super(ContactDTO.class, Contact.class, null, ContactPickListMeta.class);
		this.meetingRepository = meetingRepository;
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
		return null;
	}

	@Override
	protected ActionResultDTO<ContactDTO> doUpdateEntity(Contact entity, ContactDTO data,
			BusinessComponent bc) {
		return null;
	}


}
