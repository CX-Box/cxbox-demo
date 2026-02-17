
package org.demo.service.cxbox.anysource.relationSale;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.anysource.RelationSaleDTO;
import org.springframework.stereotype.Service;


@Getter
@Service
@RequiredArgsConstructor
public class RelationSaleService extends AnySourceVersionAwareResponseService<RelationSaleDTO, RelationSaleDTO> {


	@Getter(onMethod_ = @Override)
	private final Class<RelationSaleMetaBuilder> meta = RelationSaleMetaBuilder.class;

	@Getter(onMethod_ = @Override)
	private final Class<RelationSaleDAO> dao = RelationSaleDAO.class;


	@Override
	protected CreateResult<RelationSaleDTO> doCreateEntity(RelationSaleDTO entity, BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<RelationSaleDTO> doUpdateEntity(RelationSaleDTO entity, RelationSaleDTO data,
			BusinessComponent bc) {
		return null;
	}

}

