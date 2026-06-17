package org.demo.service.cxbox.anysource.clientstatsline;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.ClientSaleLineDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class ClientSaleLineStatsService extends AnySourceVersionAwareResponseService<ClientSaleLineDTO, ClientSaleLineDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<ClientSaleLineStatsMeta> meta = ClientSaleLineStatsMeta.class;

	@Getter(onMethod_ = @Override)
	private final Class<ClientSaleLineStatsDao> dao = ClientSaleLineStatsDao.class;

	@Override
	protected CreateResult<ClientSaleLineDTO> doCreateEntity(ClientSaleLineDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<ClientSaleLineDTO> doUpdateEntity(ClientSaleLineDTO entity, ClientSaleLineDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
