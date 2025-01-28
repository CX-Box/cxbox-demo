package org.demo.service.cxbox.anysource.salestats;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.DashboardSalesFunnelDTO;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Getter
@Service
public class SaleStatsService extends
		AnySourceVersionAwareResponseService<DashboardSalesFunnelDTO, DashboardSalesFunnelDTO> {

	private final Class<? extends AnySourceFieldMetaBuilder<DashboardSalesFunnelDTO>> metaBuilder = SaleStatsMeta.class;

	private final Class<? extends AnySourceBaseDAO<DashboardSalesFunnelDTO>> anySourceBaseDAOClass = SaleStatsDao.class;

	@Override
	protected CreateResult<DashboardSalesFunnelDTO> doCreateEntity(DashboardSalesFunnelDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<DashboardSalesFunnelDTO> doUpdateEntity(DashboardSalesFunnelDTO entity,
			DashboardSalesFunnelDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
