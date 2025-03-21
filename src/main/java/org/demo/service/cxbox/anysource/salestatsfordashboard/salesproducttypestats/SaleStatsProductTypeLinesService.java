package org.demo.service.cxbox.anysource.salestatsfordashboard.salesproducttypestats;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class SaleStatsProductTypeLinesService extends AnySourceVersionAwareResponseService<DashboardSalesProductDualDTO, DashboardSalesProductDualDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<SaleStatsProductTypeLinesMeta> meta = SaleStatsProductTypeLinesMeta.class;

	@Getter(onMethod_ = @Override)
	private final Class<SaleStatsProductTypeLinesDao> dao = SaleStatsProductTypeLinesDao.class;

	@Override
	protected CreateResult<DashboardSalesProductDualDTO> doCreateEntity(DashboardSalesProductDualDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<DashboardSalesProductDualDTO> doUpdateEntity(DashboardSalesProductDualDTO entity, DashboardSalesProductDualDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
