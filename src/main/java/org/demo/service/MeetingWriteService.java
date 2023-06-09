package org.demo.service;

import static org.demo.dto.MeetingDTO_.*;

import org.demo.controller.CxboxRestController;
import org.demo.dto.MeetingDTO;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MeetingWriteService extends VersionAwareResponseService<MeetingDTO, Meeting> {

	@Autowired
	private MeetingRepository meetingRepository;

	@Autowired
	private ClientRepository clientRepository;

	@Autowired
	private ContactRepository contactRepository;

	@Autowired
	private UserRepository userRepository;

	public MeetingWriteService() {
		super(MeetingDTO.class, Meeting.class, null, MeetingWriteMeta.class);
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
		setIfChanged(data, agenda, entity::setAgenda);
		setIfChanged(data, startDateTime, entity::setStartDateTime);
		setIfChanged(data, endDateTime, entity::setEndDateTime);
		setIfChanged(data, address, entity::setAddress);
		setIfChanged(data, notes, entity::setNotes);
		setIfChanged(data, result, entity::setResult);
		setMappedIfChanged(data, responsibleId, entity::setResponsible,
				id -> id != null ? userRepository.getById(id) : null
		);
		if (data.isFieldChanged(clientId)) {
			if (data.getClientId() != null) {
				entity.setClient(clientRepository.getById(data.getClientId()));
			} else {
				entity.setClient(null);
			}
			entity.setContact(null);
		}
		setMappedIfChanged(data, contactId, entity::setContact,
				id -> id != null ? contactRepository.getById(id) : null
		);
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
