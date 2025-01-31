package org.demo.service.cxbox.inner;

import static org.demo.controller.CxboxRestController.contactEditAssoc;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.data.dto.AssociateDTO;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.AssociateResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.Actions;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.ContactDTO;
import org.demo.dto.cxbox.inner.ContactDTO_;
import org.demo.entity.Client;
import org.demo.entity.Contact;
import org.demo.repository.ClientRepository;
import org.demo.repository.ContactRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
@RequiredArgsConstructor
public class ClientContactService extends VersionAwareResponseService<ContactDTO, Contact> {

	private final ContactRepository contactRepository;

	private final ClientRepository clientRepository;

	@Getter
	private final Class<ClientContactMeta> fieldMetaBuilder = ClientContactMeta.class;

	@Override
	protected Specification<Contact> getParentSpecification(BusinessComponent bc) {
		var clientId = bc.getParentIdAsLong();
		if (contactEditAssoc.isBc(bc)) {
			return contactRepository.getAllContactsNotAlreadyAssociatedWithClient(clientId);
		} else {
			return contactRepository.getAllClientContacts(clientId);
		}
	}

	@Override
	protected CreateResult<ContactDTO> doCreateEntity(Contact entity, BusinessComponent bc) {
		Client client = clientRepository.findById(bc.getParentIdAsLong()).orElse(null);
		if (client != null) {
			entity.getClients().add(client);
		}
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
		setIfChanged(data, ContactDTO_.phoneNumberWithoutFilter, entity::setPhoneNumber);
		setIfChanged(data, ContactDTO_.fullNameWithoutFilter, entity::setFullName);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	protected AssociateResultDTO doAssociate(List<AssociateDTO> data, BusinessComponent bc) {
		Client client = clientRepository.findById(bc.getParentIdAsLong()).orElse(null);
		List<Contact> contacts = new ArrayList<>();
		if (client != null) {
			data.stream()
					.filter(AssociateDTO::getAssociated)
					.map(AssociateDTO::getId)
					.forEach(id -> contactRepository.findById(Long.parseLong(id))
							.ifPresent(e -> {
								e.getClients().add(client);
								contacts.add(e);
							}));
			contactRepository.saveAll(contacts);
		}
		return new AssociateResultDTO(contacts.stream().map(e -> entityToDto(bc, e))
				.collect(Collectors.toList()));
	}

	@Override
	public ActionResultDTO<ContactDTO> onCancel(BusinessComponent bc) {
		return new ActionResultDTO<ContactDTO>().setAction(
				PostAction.drillDown(
						DrillDownType.INNER,
						"/screen/client/view/clienteditcontacts/"
								+ CxboxRestController.clientEdit + "/"
								+ bc.getParentIdAsLong()
				));
	}

	@Override
	public Actions<ContactDTO> getActions() {

		return Actions.<ContactDTO>builder()
				.create(crt -> crt.text("Add contact"))
				.associate(ast -> ast.text("Add Existing"))
				.action(act -> act
						.action("save_and_go_to_client_edit_contacts", "save")
						.invoker((bc, dto) -> new ActionResultDTO<ContactDTO>()
								.setAction(PostAction.drillDown(
										DrillDownType.INNER,
										"/screen/client/view/clienteditcontacts/"
												+ CxboxRestController.clientEdit + "/"
												+ bc.getParentIdAsLong()

								)))
				)
				.action(act -> act
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
				)
				.action(act -> act
						.action("delete_association_and_save_contact", "Delete association")
						.invoker((bc, dto) -> {
							Long contactId = bc.getIdAsLong();
							Long clientId = bc.getParentIdAsLong();
							var contact = contactRepository.findById(contactId).orElseThrow();
							contact.getClients().removeIf(e -> e.getId().equals(clientId));
							contactRepository.save(contact);
							return new ActionResultDTO<>();
						})
				)
				.action(act -> act
						.action("delete_association_and_contact", "Delete contact")
						.invoker((bc, dto) -> {
							Long contactId = bc.getIdAsLong();
							contactRepository.deleteById(contactId);
							return new ActionResultDTO<ContactDTO>()
									.setAction(PostAction.drillDown(
											DrillDownType.INNER,
											"/screen/client/view/clienteditcontacts/"
													+ CxboxRestController.clientEdit + "/"
													+ bc.getParentIdAsLong()

									));
						})
				)
				.cancelCreate(ccr -> ccr.text("Cancel"))
				.build();
	}

}
