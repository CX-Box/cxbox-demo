package org.demo.service.cxbox.anysource.salestats;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.DashboardSalesFunnelDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class SaleStatsService extends AnySourceVersionAwareResponseService<DashboardSalesFunnelDTO, DashboardSalesFunnelDTO> {

	@Getter(onMethod_ = {@Override})
	private final Class<SaleStatsMeta> meta = SaleStatsMeta.class;

	@Getter(onMethod_ = {@Override})
	private final Class<SaleStatsDao> dao = SaleStatsDao.class;

	@Override
	protected CreateResult<DashboardSalesFunnelDTO> doCreateEntity(DashboardSalesFunnelDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<DashboardSalesFunnelDTO> doUpdateEntity(DashboardSalesFunnelDTO entity, DashboardSalesFunnelDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
