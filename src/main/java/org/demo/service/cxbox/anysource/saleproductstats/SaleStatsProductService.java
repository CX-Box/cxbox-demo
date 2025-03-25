package org.demo.service.cxbox.anysource.saleproductstats;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class SaleStatsProductService extends AnySourceVersionAwareResponseService<DashboardSalesProductDTO, DashboardSalesProductDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<SaleStatsProductMeta> meta = SaleStatsProductMeta.class;

	@Getter(onMethod_ = @Override)
	private final Class<SaleStatsProductDao> dao = SaleStatsProductDao.class;

	@Override
	protected CreateResult<DashboardSalesProductDTO> doCreateEntity(DashboardSalesProductDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<DashboardSalesProductDTO> doUpdateEntity(DashboardSalesProductDTO entity, DashboardSalesProductDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
