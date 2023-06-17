package org.demo.service;

import java.util.Arrays;
import java.util.Objects;
import java.util.function.Consumer;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import org.cxbox.constgen.DtoField;
import org.cxbox.core.util.session.WebHelper;
import org.demo.controller.CxboxRestController;
import org.demo.dto.SaleDTO;
import org.demo.dto.SaleDTO_;
import org.demo.entity.Product;
import org.demo.entity.Sale;
import org.demo.entity.enums.MacroProduct;
import org.demo.entity.enums.TypeCalcEnum;
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
import org.demo.soap.ProductClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class SaleWriteService extends VersionAwareResponseService<SaleDTO, Sale> {

	@Autowired
	private SaleRepository saleRepository;

	@Autowired
	private ClientRepository clientRepository;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private ProductClient productClient;

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
		if (data.isFieldChanged(SaleDTO_.selDayFlg)) {
			entity.setSelDayFlg(data.getSelDayFlg());
		}
		if (data.isFieldChanged(SaleDTO_.reqProductId)) {
			entity.setReqProduct(data.getReqProductId() != null
					? entityManager.getReference(Product.class, data.getReqProductId())
					: null);
		}
		if (data.isFieldChanged(SaleDTO_.cardCategory)) {
			entity.setCardCategory(data.getCardCategory());
		}
		setIfChanged(data, SaleDTO_.macroProduct, macroproduct -> {
			if (!Objects.equals(entity.getMacroproduct(), macroproduct)) {
				entity.setMacroproduct(macroproduct);
				ifChangedForceActiveAware(entity, macroproduct, SaleDTO_.macroProduct, e -> e.setReqProduct(null));
				ifChangedForceActiveAware(entity, macroproduct, SaleDTO_.cardCategory, e -> e.setCardCategory(null));
			}
		});
		if (data.isFieldChanged(SaleDTO_.sumCreditAdditionalServices)) {
			entity.setSumCreditAdditionalServices(data.getSumCreditAdditionalServices());
		}
		if (data.isFieldChanged(SaleDTO_.pskPercentCrics)) {
			entity.setPSKPercentCrics(data.getPskPercentCrics());
		}
		if (data.isFieldChanged(SaleDTO_.resAmount)) {
			entity.setResAmount(data.getResAmount());
		}
		if (data.isFieldChanged(SaleDTO_.approvedAmount)) {
			entity.setApprovedAmount(data.getApprovedAmount());
		}
		if (data.isFieldChanged(SaleDTO_.pskPercent)) {
			entity.setPSKPercent(data.getPskPercent());
		}
		if (data.isFieldChanged(SaleDTO_.overpaymentAmountPercent)) {
			entity.setOverpaymentAmountPercent(data.getOverpaymentAmountPercent());
		}
		if (data.isFieldChanged(SaleDTO_.overpaymentAmount)) {
			entity.setOverpaymentAmount(data.getOverpaymentAmount());
		}
		if (data.isFieldChanged(SaleDTO_.overpaymentAmountDay)) {
			entity.setOverpaymentAmountDay(data.getOverpaymentAmountDay());
		}
		if (data.isFieldChanged(SaleDTO_.amountHandWithoutInsurance)) {
			entity.setAmountHandWithoutInsurance(data.getAmountHandWithoutInsurance());
		}
		if (entity.getReqProduct() != null && !Boolean.TRUE.equals(entity.getReqProduct().getReducedPaymentFlg())) {
			entity.setReducedPaymentFlag(null);
			entity.setReducedPaymentTerm(null);
			entity.setReducedPayment(null);
		} else {
			if (data.isFieldChanged(SaleDTO_.reducedPaymentTerm)) {
				entity.setReducedPaymentTerm(data.getReducedPaymentTerm());
			}
			if (data.isFieldChanged(SaleDTO_.reducedPayment)) {
				entity.setReducedPayment(data.getReducedPayment());
			}
			if (data.isFieldChanged(SaleDTO_.reducedPaymentFlag)) {
				entity.setReducedPaymentFlag(data.getReducedPaymentFlag());
				if (!Boolean.TRUE.equals(entity.getReducedPaymentFlag())) {
					entity.setReducedPaymentTerm(null);
					entity.setReducedPayment(null);
				}
			}
		}

		if (data.isFieldChanged(SaleDTO_.reqRate)) {
			entity.setReqRate(data.getReqRate());
		}

		if (data.isFieldChanged(SaleDTO_.customRateFlg)) {
			entity.setCustomRateFlg(data.getCustomRateFlg());
			if (!Boolean.TRUE.equals(entity.getCustomRateFlg())) {
				entity.setReqRate(null);
			}
		}
		if (entity.getMacroproduct() != null) {
			if (Arrays.asList(MacroProduct.NPK, MacroProduct.MFO, MacroProduct.Refinance)
					.contains(entity.getMacroproduct())) {
				if (data.isFieldChanged(SaleDTO_.paymentDate)) {
					entity.setSelDayFlg(true);
					entity.setPaymentDate(data.getPaymentDate());
				}
			} else {
				if (!MacroProduct.NCC.equals(entity.getMacroproduct())) {
					if (data.isFieldChanged(SaleDTO_.selDayFlg)) {
						entity.setSelDayFlg(data.getSelDayFlg());
						if (!Boolean.TRUE.equals(entity.getSelDayFlg())) {
							entity.setPaymentDate(null);
						} else {
							if (data.isFieldChanged(SaleDTO_.paymentDate)) {
								entity.setSelDayFlg(true);
								entity.setPaymentDate(data.getPaymentDate());
							}
						}
					}
				}
			}
		} else {
			entity.setSelDayFlg(null);
			entity.setPaymentDate(null);
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
			if (TypeCalcEnum.AmountTerm.equals(entity.getTypeCalc())) {
				entity.setReqPayment(null);
			}
			if (TypeCalcEnum.PaymentTerm.equals(entity.getTypeCalc())) {
				entity.setReqAmount(null);
			}
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

		return new ActionResultDTO<>(entityToDto(bc, entity));
	}


	@Override
	public Actions<SaleDTO> getActions() {
		return Actions.<SaleDTO>builder()
				.newAction()
				.scope(ActionScope.RECORD)
				.withAutoSaveBefore()
				.action("saveAndContinue", "Рассчитать")
				.add()
				.build();
	}

	@Override
	public boolean isDeferredCreationSupported(BusinessComponent bc) {
		return false;
	}


	//TEMPORARY SOLUTION - ONLY FOR HEAVY CALCULATIONS!
	private <T, E> void ifChangedForceActiveAware(Sale entity, T macroproduct, DtoField<SaleDTO, E> field,
			Consumer<Sale> saleConsumer) {
		if (getHttpSession() != null) {
			String key = field.getName() + entity.getId();
			if (!Objects.equals(getHttpSession().getAttribute(key), macroproduct)) {
				saleConsumer.accept(entity);
			}
			getHttpSession().setAttribute(key, macroproduct);
		}
	}

	private HttpSession getHttpSession() {
		HttpServletRequest request = WebHelper.getCurrentRequest().orElse(null);
		if (request == null) {
			return null;
		}
		return request.getSession(false);
	}

}
