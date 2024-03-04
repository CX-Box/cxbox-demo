package org.demo.service.cxbox.anysource.saleprogress;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.SalesProgressStatsDTO;
import org.springframework.stereotype.Service;

@Service
public class SaleProgressStatsService extends AnySourceVersionAwareResponseService<SalesProgressStatsDTO, SalesProgressStatsDTO> {

	public SaleProgressStatsService() {
		super(SalesProgressStatsDTO.class, SalesProgressStatsDTO.class, SaleProgressStatsMeta.class, SaleProgressStatsDao.class);
	}

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
