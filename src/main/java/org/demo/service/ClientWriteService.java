package org.demo.service;

import org.demo.controller.CxboxRestController;
import org.demo.entity.Client;
import org.demo.entity.enums.ClientEditStep;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.ClientRepository;
import org.demo.dto.ClientWriteDTO;
import org.demo.dto.ClientWriteDTO_;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import java.util.Arrays;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class ClientWriteService extends VersionAwareResponseService<ClientWriteDTO, Client> {

	private final ClientRepository clientRepository;

	public ClientWriteService(ClientRepository clientRepository) {
		super(ClientWriteDTO.class, Client.class, null, ClientWriteMeta.class);
		this.clientRepository = clientRepository;
	}

	@Override
	protected CreateResult<ClientWriteDTO> doCreateEntity(Client entity, BusinessComponent bc) {
		clientRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<ClientWriteDTO> doUpdateEntity(Client entity, ClientWriteDTO data, BusinessComponent bc) {
		if (data.isFieldChanged(ClientWriteDTO_.fullName)) {
			entity.setFullName(data.getFullName());
		}
		if (data.isFieldChanged(ClientWriteDTO_.fieldOfActivity)) {
			entity.setFieldOfActivities(
					data.getFieldOfActivity().getValues()
							.stream()
							.map(v -> FieldOfActivity.getByValue(v.getValue()))
							.collect(Collectors.toSet()));
		}
		if (data.isFieldChanged(ClientWriteDTO_.importance)) {
			entity.setImportance(data.getImportance());
		}
		if (data.isFieldChanged(ClientWriteDTO_.status)) {
			entity.setStatus(data.getStatus());
		}
		if (data.isFieldChanged(ClientWriteDTO_.address)) {
			entity.setAddress(data.getAddress());
		}
		if (data.isFieldChanged(ClientWriteDTO_.breif)) {
			entity.setBreif(data.getBreif());
		}
		if (data.isFieldChanged(ClientWriteDTO_.breifId)) {
			entity.setBreifId(data.getBreifId());
		}

		return new ActionResultDTO<>(entityToDto(bc, entity));
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
				.available(bc -> {
					Client client = clientRepository.getById(bc.getIdAsLong());
					return ClientEditStep.getNextEditStep(client).isPresent();
				})
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
				.available(bc -> {
					Client client = clientRepository.getById(bc.getIdAsLong());
					return !ClientEditStep.getNextEditStep(client).isPresent();
				})
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
				.available(bc -> {
					Client client = clientRepository.getById(bc.getIdAsLong());
					return ClientEditStep.getPreviousEditStep(client).isPresent();
				})
				.add()
				.action("cancel", "Cancel")
				.scope(ActionScope.BC)
				.withoutAutoSaveBefore()
				.invoker((bc, dto) -> new ActionResultDTO<ClientWriteDTO>().setAction(
						PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/client"
						)))
				.add()
				.build();
	}



}
