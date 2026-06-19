package org.demo.service.cxbox.anysource.clientstats;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.BaseStatsDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class ClientStatsService extends AnySourceVersionAwareResponseService<BaseStatsDTO, BaseStatsDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<ClientStatsMeta> meta = ClientStatsMeta.class;

	@Getter(onMethod_ = @Override)
	private final Class<ClientStatsDao> dao = ClientStatsDao.class;

	@Override
	protected CreateResult<BaseStatsDTO> doCreateEntity(BaseStatsDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<BaseStatsDTO> doUpdateEntity(BaseStatsDTO entity, BaseStatsDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
