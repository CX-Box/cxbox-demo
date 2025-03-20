package org.demo.service.cxbox.anysource.salestatsdualww;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO;
import org.demo.service.cxbox.anysource.salestatsdual.SaleStatsProductDualDao;
import org.demo.service.cxbox.anysource.salestatsdual.SaleStatsProductDualMeta;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class SaleStatsProductColumn2DService extends AnySourceVersionAwareResponseService<DashboardSalesProductDualDTO, DashboardSalesProductDualDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<SaleStatsProductColumn2DMeta> meta = SaleStatsProductColumn2DMeta.class;

	@Getter(onMethod_ = @Override)
	private final Class<SaleStatsProductColumn2Dao> dao = SaleStatsProductColumn2Dao.class;

	@Override
	protected CreateResult<DashboardSalesProductDualDTO> doCreateEntity(DashboardSalesProductDualDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<DashboardSalesProductDualDTO> doUpdateEntity(DashboardSalesProductDualDTO entity, DashboardSalesProductDualDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
