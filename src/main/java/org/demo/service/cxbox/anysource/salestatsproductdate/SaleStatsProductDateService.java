package org.demo.service.cxbox.anysource.salestatsproductdate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDateDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class SaleStatsProductDateService extends AnySourceVersionAwareResponseService<DashboardSalesProductDateDTO, DashboardSalesProductDateDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<SaleStatsProductDateMeta> meta = SaleStatsProductDateMeta.class;

	@Getter(onMethod_ = @Override)
	private final Class<SaleStatsProductDateDao> dao = SaleStatsProductDateDao.class;

	@Override
	protected CreateResult<DashboardSalesProductDateDTO> doCreateEntity(DashboardSalesProductDateDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<DashboardSalesProductDateDTO> doUpdateEntity(DashboardSalesProductDateDTO entity, DashboardSalesProductDateDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
