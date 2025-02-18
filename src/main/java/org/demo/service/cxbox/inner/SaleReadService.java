package org.demo.service.cxbox.inner;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.demo.entity.Sale;
import org.demo.repository.SaleRepository;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186", "java:S1170"})
@Service
@RequiredArgsConstructor
public class SaleReadService extends VersionAwareResponseService<SaleDTO, Sale> {

	private final SaleRepository saleRepository;

	@Getter(onMethod_ = {@Override})
	private final Class<SaleReadMeta> meta = SaleReadMeta.class;

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
				.create(crt -> crt.text("Add"))
				.delete(dlt -> dlt.text("Delete"))
				.action(act -> act
						.action("edit", "Edit")
						.withoutAutoSaveBefore()
						.scope(ActionScope.RECORD)
						.invoker((bc, data) -> new ActionResultDTO<SaleDTO>()
								.setAction(PostAction.drillDown(
										DrillDownType.INNER,
										"/screen/sale/view/saleedit/" + CxboxRestController.saleEdit + "/" + bc.getId()
								)))
				)
				.build();
	}

}
