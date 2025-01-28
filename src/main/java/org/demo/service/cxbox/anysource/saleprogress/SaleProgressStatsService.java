package org.demo.service.cxbox.anysource.saleprogress;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.SalesProgressStatsDTO;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Getter
@Service
public class SaleProgressStatsService extends
		AnySourceVersionAwareResponseService<SalesProgressStatsDTO, SalesProgressStatsDTO> {

	private final Class<? extends AnySourceFieldMetaBuilder<SalesProgressStatsDTO>> metaBuilder = SaleProgressStatsMeta.class;

	private final Class<? extends AnySourceBaseDAO<SalesProgressStatsDTO>> anySourceBaseDAOClass = SaleProgressStatsDao.class;

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
