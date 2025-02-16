package org.demo.service.cxbox.anysource.saleprogress;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.SalesProgressStatsDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Getter
@Service
public class SaleProgressStatsService extends AnySourceVersionAwareResponseService<SalesProgressStatsDTO, SalesProgressStatsDTO> {

	private final Class<SaleProgressStatsMeta> fieldMetaBuilder = SaleProgressStatsMeta.class;

	private final Class<SaleProgressStatsDao> anySourceBaseDAOClass = SaleProgressStatsDao.class;

	@Override
	protected CreateResult<SalesProgressStatsDTO> doCreateEntity(SalesProgressStatsDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<SalesProgressStatsDTO> doUpdateEntity(
			SalesProgressStatsDTO entity, SalesProgressStatsDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
