package org.demo.service.cxbox.anysource.clientstats;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.ClientStatsDTO;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Getter
@Service
public class ClientStatsService extends AnySourceVersionAwareResponseService<ClientStatsDTO, ClientStatsDTO> {

	private final Class<? extends AnySourceFieldMetaBuilder<ClientStatsDTO>> metaBuilder = ClientStatsMeta.class;

	private final Class<? extends AnySourceBaseDAO<ClientStatsDTO>> anySourceBaseDAOClass = ClientStatsDao.class;

	@Override
	public Class<? extends AnySourceFieldMetaBuilder<ClientStatsDTO>> getAnySourceFieldMetaBuilder() {
		return super.getAnySourceFieldMetaBuilder();
	}

	@Override
	protected CreateResult<ClientStatsDTO> doCreateEntity(ClientStatsDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<ClientStatsDTO> doUpdateEntity(ClientStatsDTO entity, ClientStatsDTO data,
			BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
