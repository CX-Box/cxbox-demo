package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.inner.ClientReadDTO;
import org.demo.entity.Client;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
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
