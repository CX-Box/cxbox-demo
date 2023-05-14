package org.demo.service;

import org.demo.controller.CxboxRestController;
import org.demo.dto.MeetingDTO;
import org.demo.dto.MeetingDTO_;
import org.demo.entity.Meeting;
import org.demo.repository.ClientRepository;
import org.demo.repository.ContactRepository;
import org.demo.repository.MeetingRepository;
import org.demo.repository.UserRepository;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class MeetingWriteService extends VersionAwareResponseService<MeetingDTO, Meeting> {

	private final MeetingRepository meetingRepository;

	private final ClientRepository clientRepository;

	private final ContactRepository contactRepository;

	private final UserRepository userRepository;

	public MeetingWriteService(MeetingRepository meetingRepository, ClientRepository clientRepository,
			ContactRepository contactRepository, UserRepository userRepository) {
		super(MeetingDTO.class, Meeting.class, null, MeetingWriteMeta.class);
		this.meetingRepository = meetingRepository;
		this.clientRepository = clientRepository;
		this.contactRepository = contactRepository;
		this.userRepository = userRepository;
	}

	@Override
	protected CreateResult<MeetingDTO> doCreateEntity(Meeting entity, BusinessComponent bc) {
		meetingRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity)).setAction(PostAction.drillDown(
				DrillDownType.INNER,
				"/screen/meeting/view/meetingedit/"
						+ CxboxRestController.meetingEdit
						+ "/" + entity.getId()
		));
	}

	@Override
	protected ActionResultDTO<MeetingDTO> doUpdateEntity(Meeting entity, MeetingDTO data, BusinessComponent bc) {
		if (data.isFieldChanged(MeetingDTO_.agenda)) {
			entity.setAgenda(data.getAgenda());
		}
		if (data.isFieldChanged(MeetingDTO_.startDateTime)) {
			entity.setStartDateTime(data.getStartDateTime());
		}
		if (data.isFieldChanged(MeetingDTO_.endDateTime)) {
			entity.setEndDateTime(data.getEndDateTime());
		}
		if (data.isFieldChanged(MeetingDTO_.address)) {
			entity.setAddress(data.getAddress());
		}
		if (data.isFieldChanged(MeetingDTO_.notes)) {
			entity.setNotes(data.getNotes());
		}
		if (data.isFieldChanged(MeetingDTO_.result)) {
			entity.setResult(data.getResult());
		}
		if (data.isFieldChanged(MeetingDTO_.responsibleId)) {
			if (data.getResponsibleId() != null) {
				entity.setResponsible(userRepository.getById(data.getResponsibleId()));
			} else {
				entity.setResponsible(null);
			}
		}
		if (data.isFieldChanged(MeetingDTO_.clientId)) {
			if (data.getClientId() != null) {
				entity.setClient(clientRepository.getById(data.getClientId()));
			} else {
				entity.setClient(null);
			}
			entity.setContact(null);
		}
		if (data.isFieldChanged(MeetingDTO_.contactId)) {
			if (data.getContactId() != null) {
				entity.setContact(contactRepository.getById(data.getContactId()));
			} else {
				entity.setContact(null);
			}
		}
		meetingRepository.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<MeetingDTO> getActions() {
		return Actions.<MeetingDTO>builder()
				.newAction()
				.scope(ActionScope.RECORD)
				.withAutoSaveBefore()
				.action("saveAndContinue", "Save")
				.invoker((bc, dto) -> new ActionResultDTO<MeetingDTO>().setAction(
						PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/meeting/view/meetingview/" + CxboxRestController.meeting + "/" + bc.getId()
						)))
				.add()
				.newAction()
				.action("cancel", "Cancel")
				.scope(ActionScope.BC)
				.withoutAutoSaveBefore()
				.invoker((bc, dto) -> new ActionResultDTO<MeetingDTO>().setAction(
						PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/meeting/"
						)))
				.add()
				.build();
	}

}
