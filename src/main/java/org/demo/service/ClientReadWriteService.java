package org.demo.service;


import static org.cxbox.api.data.dao.SpecificationUtils.and;

import java.util.Arrays;
import java.util.stream.Collectors;
import lombok.var;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.MessageType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.dto.rowmeta.PreAction;
import org.cxbox.core.service.action.ActionAvailableChecker;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.util.session.SessionService;
import org.demo.conf.cxbox.icon.ActionIcon;
import org.demo.controller.CxboxRestController;
import org.demo.dto.ClientWriteDTO;
import org.demo.dto.ClientWriteDTO_;
import org.demo.entity.Client;
import org.demo.entity.Meeting;
import org.demo.entity.enums.ClientEditStep;
import org.demo.entity.enums.ClientStatus;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.extension.FullTextSearchExt;
import org.demo.repository.ClientRepository;
import org.demo.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class ClientReadWriteService extends VersionAwareResponseService<ClientWriteDTO, Client> {

	@Autowired
	private ClientRepository clientRepository;

	@Autowired
	private MeetingRepository meetingRepository;

	@Autowired
	private SessionService sessionService;

	public ClientReadWriteService() {
		super(ClientWriteDTO.class, Client.class, null, ClientReadWriteMeta.class);
	}

	@Override
	protected Specification<Client> getSpecification(BusinessComponent bc) {
		var fullTextSearchFilterParam = FullTextSearchExt.getFullTextSearchFilterParam(bc);
		var specification = super.getSpecification(bc);
		return fullTextSearchFilterParam.map(e -> and(clientRepository.getFullTextSearchSpecification(e), specification)).orElse(specification);
	}

	@Override
	protected CreateResult<ClientWriteDTO> doCreateEntity(Client entity, BusinessComponent bc) {
		clientRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity))
				.setAction(PostAction.drillDown(
						DrillDownType.INNER,
						entity.getEditStep().getEditView() + CxboxRestController.clientEdit + "/" + entity.getId()
				));
	}

	@Override
	protected ActionResultDTO<ClientWriteDTO> doUpdateEntity(Client entity, ClientWriteDTO data, BusinessComponent bc) {
		setIfChanged(data, ClientWriteDTO_.fullName, entity::setFullName);
		if (data.isFieldChanged(ClientWriteDTO_.fieldOfActivity)) {
			entity.setFieldOfActivities(
					data.getFieldOfActivity().getValues()
							.stream()
							.map(v -> FieldOfActivity.getByValue(v.getValue()))
							.collect(Collectors.toSet()));
		}
		setIfChanged(data, ClientWriteDTO_.importance, entity::setImportance);
		setIfChanged(data, ClientWriteDTO_.status, entity::setStatus);
		setIfChanged(data, ClientWriteDTO_.address, entity::setAddress);
		setIfChanged(data, ClientWriteDTO_.briefId, entity::setBrief);
		setIfChanged(data, ClientWriteDTO_.briefId, entity::setBriefId);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public ActionResultDTO<ClientWriteDTO> onCancel(BusinessComponent bc) {
		return new ActionResultDTO<ClientWriteDTO>().setAction(
				PostAction.drillDown(
						DrillDownType.INNER,
						"/screen/client"
				));
	}

	@Override
	public Actions<ClientWriteDTO> getActions() {
		return Actions.<ClientWriteDTO>builder()
				.save().add()
				.newAction()
				.scope(ActionScope.RECORD)
				.action("next", "Save and Continue")
				.invoker((bc, dto) -> {
					Client client = clientRepository.getById(bc.getIdAsLong());
					ClientEditStep nextStep = ClientEditStep.getNextEditStep(client).get();
					client.setEditStep(nextStep);
					clientRepository.save(client);
					return new ActionResultDTO<ClientWriteDTO>().setAction(
							PostAction.drillDown(
									DrillDownType.INNER,
									nextStep.getEditView() + CxboxRestController.clientEdit + "/" + bc.getId()
							));
				})
				.available(ActionAvailableChecker.and(ActionAvailableChecker.NOT_NULL_ID, bc -> {
					Client client = clientRepository.getById(bc.getIdAsLong());
					return ClientEditStep.getNextEditStep(client).isPresent();
				}))
				.add()
				.newAction()
				.scope(ActionScope.RECORD)
				.action("finish", "Save and Close")
				.invoker((bc, dto) -> {
					Client client = clientRepository.getById(bc.getIdAsLong());
					ClientEditStep firstStep = Arrays.stream(ClientEditStep.values()).findFirst().get();
					client.setEditStep(firstStep);
					clientRepository.save(client);
					return new ActionResultDTO<ClientWriteDTO>().setAction(
							PostAction.drillDown(
									DrillDownType.INNER,
									"/screen/client"
							));
				})
				.available(ActionAvailableChecker.and(ActionAvailableChecker.NOT_NULL_ID, bc -> {
					Client client = clientRepository.getById(bc.getIdAsLong());
					return !ClientEditStep.getNextEditStep(client).isPresent();
				}))
				.add()
				.action("previous", "Back")
				.scope(ActionScope.RECORD)
				.invoker((bc, dto) -> {
					Client client = clientRepository.getById(bc.getIdAsLong());
					ClientEditStep previousStep = ClientEditStep.getPreviousEditStep(client).get();
					client.setEditStep(previousStep);
					clientRepository.save(client);
					return new ActionResultDTO<ClientWriteDTO>().setAction(
							PostAction.drillDown(
									DrillDownType.INNER,
									previousStep.getEditView() + CxboxRestController.clientEdit + "/" + bc.getId()
							));
				})
				.available(ActionAvailableChecker.and(ActionAvailableChecker.NOT_NULL_ID,bc -> {
					Client client = clientRepository.getById(bc.getIdAsLong());
					return ClientEditStep.getPreviousEditStep(client).isPresent();
				}))
				.add()
				.cancelCreate().text("Cancel").available(bc -> true).add()
				.create().text("Add").add()
				.addGroup(
						"actions",
						"Actions",
						0,
						Actions.<ClientWriteDTO>builder()
								.newAction()
								.action("edit", "Edit")
								.withoutAutoSaveBefore()
								.invoker((bc, data) -> {
									Client client = clientRepository.getById(bc.getIdAsLong());
									return new ActionResultDTO<ClientWriteDTO>()
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
									return new ActionResultDTO<ClientWriteDTO>()
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
									client.setStatus(ClientStatus.INACTIVE);
									clientRepository.save(client);
									return new ActionResultDTO<ClientWriteDTO>()
											.setAction(PostAction.showMessage(MessageType.INFO, "Client deactivated!"));
								})
								.add()
								.build()
				).withIcon(ActionIcon.MENU, false)
				.build();
	}



}
