package org.demo.service;

import org.demo.dto.ClientReadDTO;
import org.demo.entity.Client;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.springframework.stereotype.Service;

@Service
public class ClientPickListService extends VersionAwareResponseService<ClientReadDTO, Client> {

	public ClientPickListService() {
		super(ClientReadDTO.class, Client.class, null, ClientPickListMeta.class);
	}

	@Override
	protected CreateResult<ClientReadDTO> doCreateEntity(Client entity, BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<ClientReadDTO> doUpdateEntity(Client entity, ClientReadDTO data,
			BusinessComponent bc) {
		return null;
	}


}
