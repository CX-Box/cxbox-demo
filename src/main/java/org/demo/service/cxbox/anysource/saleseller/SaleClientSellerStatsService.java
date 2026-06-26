package org.demo.service.cxbox.anysource.saleseller;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.SaleSellerStatsDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class SaleClientSellerStatsService extends AnySourceVersionAwareResponseService<SaleSellerStatsDTO, SaleSellerStatsDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<SaleClientSellerStatsMeta> meta = SaleClientSellerStatsMeta.class;

	@Getter(onMethod_ = @Override)
	private final Class<SaleClientSellerStatsDao> dao = SaleClientSellerStatsDao.class;

	@Override
	protected CreateResult<SaleSellerStatsDTO> doCreateEntity(SaleSellerStatsDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<SaleSellerStatsDTO> doUpdateEntity(SaleSellerStatsDTO entity, SaleSellerStatsDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}
