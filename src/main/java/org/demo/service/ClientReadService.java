package org.demo.service;

import org.demo.conf.cxbox.icon.ActionIcon;
import org.demo.controller.CxboxRestController;
import org.demo.entity.Client;
import org.demo.entity.Meeting;
import org.demo.entity.enums.ClientStatus;
import org.demo.repository.ClientRepository;
import org.demo.dto.ClientReadDTO;
import org.demo.repository.MeetingRepository;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.MessageType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.dto.rowmeta.PreAction;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.util.session.SessionService;
import org.springframework.stereotype.Service;

@Service
public class ClientReadService extends VersionAwareResponseService<ClientReadDTO, Client> {

	private final ClientRepository clientRepository;

	private final MeetingRepository meetingRepository;

	private final SessionService sessionService;

	public ClientReadService(ClientRepository clientRepository, MeetingRepository meetingRepository,
			SessionService sessionService) {
		super(ClientReadDTO.class, Client.class, null, ClientReadMeta.class);
		this.clientRepository = clientRepository;
		this.meetingRepository = meetingRepository;
		this.sessionService = sessionService;
	}

	@Override
	protected CreateResult<ClientReadDTO> doCreateEntity(Client entity, BusinessComponent bc) {
		clientRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity))
				.setAction(PostAction.drillDown(
						DrillDownType.INNER,
						entity.getEditStep().getEditView() + CxboxRestController.clientEdit + "/" + entity.getId()
				));
	}

	@Override
	protected ActionResultDTO<ClientReadDTO> doUpdateEntity(Client entity, ClientReadDTO data, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	public Actions<ClientReadDTO> getActions() {
		return Actions.<ClientReadDTO>builder()
				.create().text("Add").add()
				.addGroup(
						"actions",
						"Actions",
						0,
						Actions.<ClientReadDTO>builder()
								.newAction()
								.action("edit", "Edit")
								.withoutAutoSaveBefore()
								.invoker((bc, data) -> {
									Client client = clientRepository.getById(bc.getIdAsLong());
									return new ActionResultDTO<ClientReadDTO>()
											.setAction(PostAction.drillDown(
													DrillDownType.INNER,
													client.getEditStep().getEditView()
															+ CxboxRestController.clientEdit + "/"
															+ bc.getId()
											));
								})
								.add()
								.newAction()
								.action("create_meeting", "Create Meeting")
								.withAutoSaveBefore()
								.invoker((bc, data) -> {
									Client client = clientRepository.getById(bc.getIdAsLong());
									Meeting meeting = meetingRepository.save(new Meeting()
											.setResponsible(sessionService.getSessionUser())
											.setClient(client)
									);
									return new ActionResultDTO<ClientReadDTO>()
											.setAction(PostAction.drillDown(
													DrillDownType.INNER,
													"screen/meeting/view/meetingedit/"
															+ CxboxRestController.meetingEdit + "/"
															+ meeting.getId()
											));
								})
								.available(bc -> false)//TODO>>remove false, after fixing UI error for this drill-down
								.add()
								.newAction()
								.action("deactivate", "Deactivate")
								.withAutoSaveBefore()
								.withPreAction(PreAction.confirm("Are You sure You want to deactivate the client?"))
								.invoker((bc, data) -> {
									Client client = clientRepository.getById(bc.getIdAsLong());
									client.setStatus(ClientStatus.Inactive);
									clientRepository.save(client);
									return new ActionResultDTO<ClientReadDTO>()
											.setAction(PostAction.showMessage(MessageType.INFO, "Client deactivated!"));
								})
								.add()
								.build()
				).withIcon(ActionIcon.MENU, false)
				.build();
	}

	@Override
	public boolean isDeferredCreationSupported(BusinessComponent bc) {
		return false;
	}

}
