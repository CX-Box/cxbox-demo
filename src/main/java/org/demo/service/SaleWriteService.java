package org.demo.service;

import org.demo.controller.CxboxRestController;
import org.demo.dto.SaleDTO;
import org.demo.dto.SaleDTO_;
import org.demo.entity.Sale;
import org.demo.repository.ClientRepository;
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
public class SaleWriteService extends VersionAwareResponseService<SaleDTO, Sale> {

	private final SaleRepository saleRepository;

	private final ClientRepository clientRepository;

	public SaleWriteService(SaleRepository SaleRepository, ClientRepository clientRepository) {
		super(SaleDTO.class, Sale.class, null, SaleWriteMeta.class);
		this.saleRepository = SaleRepository;
		this.clientRepository = clientRepository;
	}

	@Override
	protected CreateResult<SaleDTO> doCreateEntity(Sale entity, BusinessComponent bc) {
		saleRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity)).setAction(PostAction.drillDown(
				DrillDownType.INNER,
				"/screen/sale/view/salelist/"
						+ CxboxRestController.saleEdit
						+ "/" + entity.getId()
		));
	}

	@Override
	protected ActionResultDTO<SaleDTO> doUpdateEntity(Sale entity, SaleDTO data, BusinessComponent bc) {
		if (data.isFieldChanged(SaleDTO_.clientId)) {
			if (data.getClientId() != null) {
				entity.setClient(clientRepository.getById(data.getClientId()));
			} else {
				entity.setClient(null);
			}
		}
		setIfChanged(data, SaleDTO_.product, entity::setProduct);
		setIfChanged(data, SaleDTO_.status, entity::setStatus);
		setIfChanged(data, SaleDTO_.sum, entity::setSum);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<SaleDTO> getActions() {
		return Actions.<SaleDTO>builder()
				.newAction()
				.scope(ActionScope.RECORD)
				.withAutoSaveBefore()
				.action("saveAndContinue", "Save")
				.invoker((bc, dto) -> new ActionResultDTO<SaleDTO>().setAction(
						PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/sale/view/salelist/" + CxboxRestController.sale + "/" + bc.getId()
						)))
				.add()
				.newAction()
				.action("cancel", "Cancel")
				.scope(ActionScope.BC)
				.withoutAutoSaveBefore()
				.invoker((bc, dto) -> new ActionResultDTO<SaleDTO>().setAction(
						PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/sale/"
						)))
				.add()
				.build();
	}

}
