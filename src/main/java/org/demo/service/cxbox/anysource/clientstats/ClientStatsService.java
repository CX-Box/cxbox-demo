package org.demo.service.cxbox.anysource.clientstats;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.ClientStatsDTO;
import org.springframework.stereotype.Service;

@Service
public class ClientStatsService extends AnySourceVersionAwareResponseService<ClientStatsDTO, ClientStatsDTO> {

	public ClientStatsService() {
		super(ClientStatsDTO.class, ClientStatsDTO.class, ClientStatsMeta.class, ClientStatsDAO.class);
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
