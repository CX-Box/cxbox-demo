package org.demo.service.cxbox.inner;


import static org.cxbox.api.data.dao.SpecificationUtils.and;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
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
import org.demo.conf.cxbox.customization.icon.ActionIcon;
import org.demo.conf.cxbox.extension.fulltextsearch.FullTextSearchExt;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.ClientWriteDTO;
import org.demo.dto.cxbox.inner.ClientWriteDTO_;
import org.demo.entity.Client;
import org.demo.entity.Meeting;
import org.demo.entity.enums.ClientEditStep;
import org.demo.entity.enums.ClientStatus;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.ClientRepository;
import org.demo.repository.MeetingRepository;
import org.demo.repository.core.UserRepository;
import org.demo.service.mail.MailSendingService;
import org.jobrunr.scheduling.BackgroundJob;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
@RequiredArgsConstructor
public class ClientReadWriteService extends VersionAwareResponseService<ClientWriteDTO, Client> {

	private final ClientRepository clientRepository;

	private final MeetingRepository meetingRepository;

	private final UserRepository userRepository;

	private final SessionService sessionService;

	@Getter
	private final Class<ClientReadWriteMeta> fieldMetaBuilder = ClientReadWriteMeta.class;

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
		setIfChanged(data, ClientWriteDTO_.brief, entity::setBrief);
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
				.save(sv -> sv)
				.action(act -> act
								.scope(ActionScope.RECORD)
								.action("next", "Save and Continue")
								.invoker((bc, dto) -> {
									Client client = clientRepository.getById(bc.getIdAsLong());
									ClientEditStep nextStep = ClientEditStep.getNextEditStep(client).get();
									client.setEditStep(nextStep);
									clientRepository.save(client);

									BackgroundJob.<MailSendingService>schedule(
											LocalDateTime.now().plusHours(5),
											x -> x.stats("save pressed job")
									);

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
				)
				.action(act -> act
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
				)
				.action(act -> act
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
						.available(ActionAvailableChecker.and(ActionAvailableChecker.NOT_NULL_ID, bc -> {
							Client client = clientRepository.getById(bc.getIdAsLong());
							return ClientEditStep.getPreviousEditStep(client).isPresent();
						}))
				)
				.cancelCreate(ccr -> ccr.text("Cancel").available(bc -> true))
				.create(crt -> crt.text("Add"))
				.addGroup(
						"actions",
						"Actions",
						3,
						Actions.<ClientWriteDTO>builder()
								.action(act -> act
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
								)
								.action(act -> act
										.action("create_meeting", "Create Meeting")
										.withAutoSaveBefore()
										.invoker((bc, data) -> {
											Client client = clientRepository.getById(bc.getIdAsLong());
											Meeting meeting = meetingRepository.save(new Meeting()
													.setResponsible(userRepository.getReferenceById(sessionService.getSessionUser().getId()))
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
								)
								.action(act -> act
										.action("deactivate", "Deactivate")
										.withAutoSaveBefore()
										.withPreAction(bc -> PreAction.confirm("Are You sure You want to deactivate the client?"))
										.invoker((bc, data) -> {
											Client client = clientRepository.getById(bc.getIdAsLong());
											client.setStatus(ClientStatus.INACTIVE);
											clientRepository.save(client);
											return new ActionResultDTO<ClientWriteDTO>()
													.setAction(PostAction.showMessage(MessageType.INFO, "Client deactivated!"));
										})
								)
								.build()
				).withIcon(ActionIcon.MENU, false)
				.build();
	}



}
