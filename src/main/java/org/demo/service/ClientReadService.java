package org.demo.service;

import org.demo.conf.cxbox.icon.ActionIcon;
import org.demo.controller.CxboxRestController;
import org.demo.entity.Client;
import org.demo.entity.Product;
import org.demo.entity.enums.ClientStatus;
import org.demo.repository.ClientRepository;
import org.demo.dto.ClientReadDTO;
import org.demo.repository.ProductRepository;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class ClientReadService extends VersionAwareResponseService<ClientReadDTO, Client> {

	@Autowired
	private ClientRepository clientRepository;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private SessionService sessionService;

	public ClientReadService() {
		super(ClientReadDTO.class, Client.class, null, ClientReadMeta.class);
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
								.action("deactivate", "Deactivate")
								.withAutoSaveBefore()
								.withPreAction(PreAction.confirm("Are You sure You want to deactivate the client?"))
								.invoker((bc, data) -> {
									Client client = clientRepository.getById(bc.getIdAsLong());
									client.setStatus(ClientStatus.INACTIVE);
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
