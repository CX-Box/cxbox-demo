package org.demo.service.cxbox.anysource.salesstatsproducttypedate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.DashboardSalesProductTypeDateDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class SaleStatsProductTypeDateService extends AnySourceVersionAwareResponseService<DashboardSalesProductTypeDateDTO, DashboardSalesProductTypeDateDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<SaleStatsProductTypeDateMeta> meta = SaleStatsProductTypeDateMeta.class;

	@Getter(onMethod_ = @Override)
	private final Class<SaleStatsProductTypeDateDao> dao = SaleStatsProductTypeDateDao.class;

	@Override
	protected CreateResult<DashboardSalesProductTypeDateDTO> doCreateEntity(DashboardSalesProductTypeDateDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<DashboardSalesProductTypeDateDTO> doUpdateEntity(DashboardSalesProductTypeDateDTO entity, DashboardSalesProductTypeDateDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
