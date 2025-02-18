package org.demo.service.cxbox.anysource.clientstats;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.ClientStatsDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class ClientStatsService extends AnySourceVersionAwareResponseService<ClientStatsDTO, ClientStatsDTO> {

	@Getter(onMethod_ = {@Override})
	private final Class<ClientStatsMeta> meta = ClientStatsMeta.class;

	@Getter(onMethod_ = {@Override})
	private final Class<ClientStatsDao> dao = ClientStatsDao.class;

	@Override
	protected CreateResult<ClientStatsDTO> doCreateEntity(ClientStatsDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<ClientStatsDTO> doUpdateEntity(ClientStatsDTO entity, ClientStatsDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
