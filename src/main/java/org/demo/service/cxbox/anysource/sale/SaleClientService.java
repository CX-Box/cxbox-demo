package org.demo.service.cxbox.anysource.sale;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.Actions;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.springframework.stereotype.Service;


@Getter
@Service
@RequiredArgsConstructor
public class SaleClientService extends AnySourceVersionAwareResponseService<SaleDTO, SaleDTO> {

	@Getter(onMethod_ = @Override)
	private final Class<SaleClientMetaBuilder> meta = SaleClientMetaBuilder.class;

	@Getter(onMethod_ = @Override)
	private final Class<SaleClientDAO> dao = SaleClientDAO.class;

	@Override
	protected CreateResult<SaleDTO> doCreateEntity(SaleDTO entity, BusinessComponent bc) {
		return new CreateResult<>(entityToDto(bc, getBaseDao().create(bc, entity)))
				.setAction(PostAction.refreshBc(bc));
	}

	@Override
	protected ActionResultDTO<SaleDTO> doUpdateEntity(SaleDTO entity, SaleDTO data,
			BusinessComponent bc) {
		return new ActionResultDTO<>(entityToDto(bc, getBaseDao().update(bc, entity)))
				.setAction(PostAction.refreshBc(bc));
	}

	@Override
	public Actions<SaleDTO> getActions() {
		return Actions.<SaleDTO>builder()
				.create(crt -> crt.text("Create"))
				.delete(dlt -> dlt.text("Delete"))
				.save(sv -> sv.text("Save"))
				.build();
	}

}