package org.demo.service;

import org.demo.controller.CxboxRestController;
import org.demo.dto.ContactDTO_;
import org.demo.entity.Client;
import org.demo.entity.Contact;
import org.demo.entity.Contact_;
import org.demo.repository.ClientRepository;
import org.demo.repository.ContactRepository;
import org.demo.dto.ContactDTO;
import org.cxbox.api.data.dto.AssociateDTO;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.AssociateResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.model.core.entity.BaseEntity_;
import java.util.Collections;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class ClientContactService extends VersionAwareResponseService<ContactDTO, Contact> {

	private final ContactRepository contactRepository;

	private final ClientRepository clientRepository;

	public ClientContactService(ContactRepository contactRepository, ClientRepository clientRepository) {
		super(ContactDTO.class, Contact.class, null, ClientContactMeta.class);
		this.contactRepository = contactRepository;
		this.clientRepository = clientRepository;
	}

	@Override
	protected Specification<Contact> getParentSpecification(BusinessComponent bc) {
		return (root, cq, cb) -> cb.and(
				super.getParentSpecification(bc).toPredicate(root, cq, cb),
				cb.equal(root.get(Contact_.client).get(BaseEntity_.id), bc.getParentIdAsLong())
		);

	}

	@Override
	protected CreateResult<ContactDTO> doCreateEntity(Contact entity, BusinessComponent bc) {
		Client client = clientRepository.findById(bc.getParentIdAsLong()).orElse(null);
		entity.setClient(client);
		contactRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity))
				.setAction(PostAction.drillDown(
						DrillDownType.INNER,
						"/screen/client/view/clienteditcreatecontact/"
								+ CxboxRestController.clientEdit + "/"
								+ client.getId() + "/"
								+ CxboxRestController.contactEdit + "/"
								+ entity.getId()
				));
	}

	@Override
	protected ActionResultDTO<ContactDTO> doUpdateEntity(Contact entity, ContactDTO data, BusinessComponent bc) {
		if (data.isFieldChanged(ContactDTO_.fullName)) {
			entity.setFullName(data.getFullName());
		}
		if (data.isFieldChanged(ContactDTO_.email)) {
			entity.setEmail(data.getEmail());
		}
		if (data.isFieldChanged(ContactDTO_.phoneNumber)) {
			entity.setPhoneNumber(data.getPhoneNumber());
		}
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	protected AssociateResultDTO doAssociate(List<AssociateDTO> data, BusinessComponent bc) {
		return new AssociateResultDTO(Collections.emptyList())
				.setAction(PostAction.refreshBc(bc));
	}

	@Override
	public Actions<ContactDTO> getActions() {

		return Actions.<ContactDTO>builder()
				.create()
				.text("Add contact")
				.add()
				.associate()
				.text("Add Existing")
				.add()
				.newAction()
				.action("save_and_go_to_client_edit_contacts", "save")
				.invoker((bc, dto) -> new ActionResultDTO<ContactDTO>()
						.setAction(PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/client/view/clienteditcontacts/"
										+ CxboxRestController.clientEdit + "/"
										+ bc.getParentIdAsLong()

						)))
				.add()
				.newAction()
				.action("edit", "Edit")
				.invoker((bc, dto) -> new ActionResultDTO<ContactDTO>()
						.setAction(PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/client/view/clienteditcreatecontact/"
										+ CxboxRestController.clientEdit + "/"
										+ bc.getParentIdAsLong() + "/"
										+ CxboxRestController.contactEdit + "/"
										+ bc.getId()

						)))
				.add()
				.newAction()
				.action("cancel", "Cancel")
				.scope(ActionScope.BC)
				.withoutAutoSaveBefore()
				.invoker((bc, dto) -> new ActionResultDTO<ContactDTO>()
						.setAction(PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/client/view/clienteditcontacts/"
										+ CxboxRestController.clientEdit + "/"
										+ bc.getParentIdAsLong()

						)))
				.add()
				.build();
	}

}
