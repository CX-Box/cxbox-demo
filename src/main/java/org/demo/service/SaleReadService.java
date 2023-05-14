package org.demo.service;

import org.demo.controller.CxboxRestController;
import org.demo.dto.SaleDTO;
import org.demo.entity.Sale;
import org.demo.repository.SaleRepository;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class SaleReadService extends VersionAwareResponseService<SaleDTO, Sale> {

	private final SaleRepository saleRepository;

	public SaleReadService(SaleRepository saleRepository) {
		super(SaleDTO.class, Sale.class, null, SaleMeta.class);
		this.saleRepository = saleRepository;
	}

	@Override
	protected CreateResult<SaleDTO> doCreateEntity(Sale entity, BusinessComponent bc) {
		saleRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity))
				.setAction(PostAction.drillDown(
						DrillDownType.INNER,
						"/screen/sale/view/saleedit/" + CxboxRestController.saleEdit + "/" + entity.getId()
				));
	}

	@Override
	protected ActionResultDTO<SaleDTO> doUpdateEntity(Sale entity, SaleDTO data, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	public Actions<SaleDTO> getActions() {
		return Actions.<SaleDTO>builder()
				.create().text("Add").add()
				.newAction()
				.action("edit", "Edit")
				.withoutAutoSaveBefore()
				.scope(ActionScope.RECORD)
				.invoker((bc, data) -> new ActionResultDTO<SaleDTO>()
						.setAction(PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/sale/view/saleedit/" + CxboxRestController.saleEdit + "/" + bc.getId()
						)))
				.add()
				.build();
	}

	@Override
	public boolean isDeferredCreationSupported(BusinessComponent bc) {
		return false;
	}

}
