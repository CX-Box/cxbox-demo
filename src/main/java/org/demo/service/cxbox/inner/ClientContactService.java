package org.demo.service.cxbox.inner;

import java.util.Collections;
import java.util.List;
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
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.ContactDTO;
import org.demo.dto.cxbox.inner.ContactDTO_;
import org.demo.entity.Client;
import org.demo.entity.Contact;
import org.demo.entity.Contact_;
import org.demo.repository.ClientRepository;
import org.demo.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class ClientContactService extends VersionAwareResponseService<ContactDTO, Contact> {

	@Autowired
	private ContactRepository contactRepository;

	@Autowired
	private ClientRepository clientRepository;

	public ClientContactService() {
		super(ContactDTO.class, Contact.class, null, ClientContactMeta.class);
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
		CreateResult<ContactDTO> result = new CreateResult<>(entityToDto(bc, entity));

		if (client != null) {
			result
					.setAction(PostAction.drillDown(
							DrillDownType.INNER,
							"/screen/client/view/clienteditcreatecontact/"
									+ CxboxRestController.clientEdit + "/"
									+ client.getId() + "/"
									+ CxboxRestController.contactEdit + "/"
									+ entity.getId()
					));
		}
		return result;
	}

	@Override
	protected ActionResultDTO<ContactDTO> doUpdateEntity(Contact entity, ContactDTO data, BusinessComponent bc) {
		setIfChanged(data, ContactDTO_.fullName, entity::setFullName);
		setIfChanged(data, ContactDTO_.email, entity::setEmail);
		setIfChanged(data, ContactDTO_.phoneNumber, entity::setPhoneNumber);
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
