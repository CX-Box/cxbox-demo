package org.demo.service;

import java.util.stream.Collectors;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.CxboxActionIconSpecifier;
import org.demo.dto.ClientWriteDTO;
import org.demo.dto.ClientWriteDTO_;
import org.demo.entity.Client;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.ClientRepository;
import org.springframework.stereotype.Service;

@Service
public class ClientEditableListService extends VersionAwareResponseService<ClientWriteDTO, Client> {

	private final ClientRepository clientRepository;

	public ClientEditableListService(ClientRepository clientRepository) {
		super(ClientWriteDTO.class, Client.class, null, ClientEditableListMeta.class);
		this.clientRepository = clientRepository;
	}

	@Override
	protected CreateResult<ClientWriteDTO> doCreateEntity(Client entity, BusinessComponent bc) {
		clientRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
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
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<ClientWriteDTO> getActions() {
		return Actions.<ClientWriteDTO>builder()
				.create().add()
				.save().add()
				.cancelCreate().withIcon(CxboxActionIconSpecifier.CLOSE, false).add()
				.build();
	}

}
