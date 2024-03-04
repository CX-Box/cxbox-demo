package org.demo.service.cxbox.external.clientstats;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.ExternalVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.ClientStatsDTO;
import org.springframework.stereotype.Service;

@Service
public class ClientStatsReadService extends ExternalVersionAwareResponseService<ClientStatsDTO, ClientStatsDTO> {

	public ClientStatsReadService() {
		super(ClientStatsDTO.class, ClientStatsDTO.class, ClientStatsReadMeta.class, ClientStatsDAO.class);
	}

	@Override
	protected CreateResult<ClientStatsDTO> doCreateEntity(ClientStatsDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<ClientStatsDTO> doUpdateEntity(ClientStatsDTO entity, ClientStatsDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
