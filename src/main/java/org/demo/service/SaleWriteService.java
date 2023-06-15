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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class SaleWriteService extends VersionAwareResponseService<SaleDTO, Sale> {

	@Autowired
	private SaleRepository saleRepository;

	@Autowired
	private ClientRepository clientRepository;

	public SaleWriteService() {
		super(SaleDTO.class, Sale.class, null, SaleWriteMeta.class);
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
		if (data.isFieldChanged(SaleDTO_.reducedPaymentTerm)) {
			entity.setReducedPaymentTerm(data.getReducedPaymentTerm());
		}
		if (data.isFieldChanged(SaleDTO_.reducedPayment)) {
			entity.setReducedPayment(data.getReducedPayment());
		}
		if (data.isFieldChanged(SaleDTO_.reducedPaymentFlag)) {
			entity.setReducedPaymentFlag(data.getReducedPaymentFlag());
		}
		if (data.isFieldChanged(SaleDTO_.reqRate)) {
			entity.setReqRate(data.getReqRate());
		}
		if (data.isFieldChanged(SaleDTO_.customRateFlg)) {
			entity.setCustomRateFlg(data.getCustomRateFlg());
		}
		if (data.isFieldChanged(SaleDTO_.rBSelectDayFlag)) {
			entity.setRBSelectDayFlag(data.getRBSelectDayFlag());
		}
		if (data.isFieldChanged(SaleDTO_.paymentDate)) {
			entity.setPaymentDate(data.getPaymentDate());
		}
		if (data.isFieldChanged(SaleDTO_.reqCurrency)) {
			entity.setReqCurrency(data.getReqCurrency());
		}
		if (data.isFieldChanged(SaleDTO_.reqTerm)) {
			entity.setReqTerm(data.getReqTerm());
		}
		if (data.isFieldChanged(SaleDTO_.reqPayment)) {
			entity.setReqPayment(data.getReqPayment());
		}
		if (data.isFieldChanged(SaleDTO_.reqAmount)) {
			entity.setReqAmount(data.getReqAmount());
		}
		if (data.isFieldChanged(SaleDTO_.typeCalc)) {
			entity.setTypeCalc(data.getTypeCalc());
		}
		if (data.isFieldChanged(SaleDTO_.cardHint)) {
			entity.setCardHint(data.getCardHint());
		}
		if (data.isFieldChanged(SaleDTO_.emptyField)) {
			entity.setHintTest(data.getEmptyField());
		}
		if (data.isFieldChanged(SaleDTO_.cardCommissionThirdYear)) {
			entity.setCardCommissionThirdYear(data.getCardCommissionThirdYear());
		}
		if (data.isFieldChanged(SaleDTO_.tariffMinMonthPayment)) {
			entity.setTariffMinMonthPayment(data.getTariffMinMonthPayment());
		}
		if (data.isFieldChanged(SaleDTO_.cardCategory)) {
			entity.setCardCategory(data.getCardCategory());
		}
		if (data.isFieldChanged(SaleDTO_.collateralAvailability)) {
			entity.setCollateralAvailability(data.getCollateralAvailability());
		}
		if (data.isFieldChanged(SaleDTO_.clientId)) {
			if (data.getClientId() != null) {
				entity.setClient(clientRepository.getById(data.getClientId()));
			} else {
				entity.setClient(null);
			}
		}
		setIfChanged(data, SaleDTO_.macroProduct, entity::setProduct);
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
