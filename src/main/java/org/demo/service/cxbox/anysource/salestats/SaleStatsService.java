package org.demo.service.cxbox.anysource.salestats;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.DashboardSalesFunnelDTO;
import org.springframework.stereotype.Service;

@Service
public class SaleStatsService extends AnySourceVersionAwareResponseService<DashboardSalesFunnelDTO, DashboardSalesFunnelDTO> {

	public SaleStatsService() {
		super(DashboardSalesFunnelDTO.class, DashboardSalesFunnelDTO.class, SaleStatsMeta.class, SaleStatsDAO.class);
	}

	@Override
	protected CreateResult<DashboardSalesFunnelDTO> doCreateEntity(DashboardSalesFunnelDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<DashboardSalesFunnelDTO> doUpdateEntity(DashboardSalesFunnelDTO entity, DashboardSalesFunnelDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
