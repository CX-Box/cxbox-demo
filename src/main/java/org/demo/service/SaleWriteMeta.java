package org.demo.service;


import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.demo.dto.SaleDTO;
import org.demo.dto.SaleDTO_;
import org.demo.entity.Sale;
import org.demo.entity.enums.CardCategoryEnum;
import org.demo.entity.enums.CollateralAvailabilityEnum;
import org.demo.entity.enums.MacroProduct;
import org.demo.entity.enums.PaymentDateEnum;
import org.demo.entity.enums.ReqCurrencyEnum;
import org.demo.entity.enums.SaleStatus;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.entity.enums.TypeCalcEnum;
import org.demo.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class SaleWriteMeta extends FieldMetaBuilder<SaleDTO> {

	@Autowired
	SaleRepository saleRepository;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<SaleDTO> fields, InnerBcDescription bcDescription, Long id,
			Long parentId) {

		Optional<Sale> byId = saleRepository.findById(id);
		if (byId.isPresent()) {
			Sale calc = byId.get();
			fields.setEnabled(SaleDTO_.macroProduct);
			fields.setRequired(SaleDTO_.macroProduct);
			fields.setEnabled(SaleDTO_.typeCalc);
			fields.setEnabled(SaleDTO_.collateralAvailability);
			fields.setRequired(SaleDTO_.typeCalc);

			fields.setEnabled(SaleDTO_.customRateFlg);
			if (Boolean.TRUE.equals(calc.getCustomRateFlg())) {
				fields.setEnabled(SaleDTO_.reqRate);
				fields.setRequired(SaleDTO_.reqRate);
			}

			if (calc.getMacroproduct() != null) {
				if (Arrays.asList(MacroProduct.NPK, MacroProduct.MFO, MacroProduct.Refinance)
						.contains(calc.getMacroproduct())) {
					fields.setEnabled(SaleDTO_.paymentDate);
					fields.setRequired(SaleDTO_.paymentDate);
				} else {
					if (!MacroProduct.NCC.equals(calc.getMacroproduct())) {
						fields.setEnabled(SaleDTO_.selDayFlg);
						if (Boolean.TRUE.equals(calc.getSelDayFlg())) {
							fields.setEnabled(SaleDTO_.paymentDate);
							fields.setRequired(SaleDTO_.paymentDate);
						}
					}
				}

				fields.setEnabled(SaleDTO_.reqProduct);
				fields.setEnabled(SaleDTO_.reqProductId);
				fields.setRequired(SaleDTO_.reqProduct);
				if (MacroProduct.CreditCard.equals(calc.getMacroproduct()) || MacroProduct.NCC.equals(calc.getMacroproduct())) {
					fields.setEnabled(SaleDTO_.cardCategory);
					fields.setRequired(SaleDTO_.cardCategory);
				}
				if (calc.getReqProduct() != null && Boolean.TRUE.equals(calc.getReqProduct().getReducedPaymentFlg())) {
					fields.setEnabled(SaleDTO_.reducedPaymentFlag);
				}
				if (Boolean.TRUE.equals(calc.getReducedPaymentFlag())) {
					fields.setEnabled(SaleDTO_.reducedPayment);
					fields.setRequired(SaleDTO_.reducedPayment);
					fields.setEnabled(SaleDTO_.reducedPaymentTerm);
					fields.setRequired(SaleDTO_.reducedPaymentTerm);
				}
			}

			if (TypeCalcEnum.AmountTerm.equals(calc.getTypeCalc())) {
				fields.setEnabled(SaleDTO_.reqAmount);
				fields.setRequired(SaleDTO_.reqAmount);
				fields.setEnabled(SaleDTO_.reqTerm);
				fields.setRequired(SaleDTO_.reqTerm);
			} else if (TypeCalcEnum.PaymentTerm.equals(calc.getTypeCalc())) {
				fields.setEnabled(SaleDTO_.reqPayment);
				fields.setRequired(SaleDTO_.reqPayment);
				fields.setEnabled(SaleDTO_.reqTerm);
				fields.setRequired(SaleDTO_.reqTerm);
			}
		} else {
			fields.setEnabled(SaleDTO_.reqProductId);
			fields.setEnabled(SaleDTO_.reqProduct);
			fields.setEnabled(SaleDTO_.sumCreditAdditionalServices);
			fields.setEnabled(SaleDTO_.pskPercentCrics);
			fields.setEnabled(SaleDTO_.resAmount);
			fields.setEnabled(SaleDTO_.approvedAmount);
			fields.setEnabled(SaleDTO_.pskPercent);
			fields.setEnabled(SaleDTO_.overpaymentAmountPercent);
			fields.setEnabled(SaleDTO_.overpaymentAmount);
			fields.setEnabled(SaleDTO_.overpaymentAmountDay);
			fields.setEnabled(SaleDTO_.amountHandWithoutInsurance);
			fields.setEnabled(SaleDTO_.reducedPaymentTerm);
			fields.setEnabled(SaleDTO_.reducedPayment);
			fields.setEnabled(SaleDTO_.reducedPaymentFlag);
			fields.setEnabled(SaleDTO_.reqRate);
			fields.setEnabled(SaleDTO_.customRateFlg);
			fields.setEnabled(SaleDTO_.selDayFlg);
			fields.setEnabled(SaleDTO_.paymentDate);
			fields.setEnabled(SaleDTO_.reqCurrency);
			fields.setEnabled(SaleDTO_.reqTerm);
			fields.setEnabled(SaleDTO_.reqPayment);
			fields.setEnabled(SaleDTO_.reqAmount);
			fields.setEnabled(SaleDTO_.typeCalc);
			fields.setEnabled(SaleDTO_.cardHint);
			fields.setEnabled(SaleDTO_.emptyField);
			fields.setEnabled(SaleDTO_.cardCommissionThirdYear);
			fields.setEnabled(SaleDTO_.tariffMinMonthPayment);
			fields.setEnabled(SaleDTO_.cardCategory);
			fields.setEnabled(SaleDTO_.collateralAvailability);
			fields.setEnabled(SaleDTO_.clientName, SaleDTO_.clientId, SaleDTO_.macroProduct, SaleDTO_.status, SaleDTO_.sum);


		}

		fields.setEnumValues(SaleDTO_.paymentDate, PaymentDateEnum.values());
		fields.setEnumValues(SaleDTO_.reqCurrency, ReqCurrencyEnum.values());
		fields.setEnumValues(SaleDTO_.typeCalc, TypeCalcEnum.values());
		fields.setEnumValues(SaleDTO_.cardCategory, CardCategoryEnum.values());
		fields.setEnumValues(SaleDTO_.collateralAvailability, CollateralAvailabilityEnum.values());
		fields.setEnumValues(
				SaleDTO_.macroProduct,
				Arrays.stream(MacroProduct.values()).filter(e -> e.getOrder() < 100)
						.sorted(Comparator.comparing(MacroProduct::getOrder)).toArray(MacroProduct[]::new)
		);
		fields.setEnumValues(SaleDTO_.status, SaleStatus.values());


	}


	@Override
	public void buildIndependentMeta(FieldsMeta<SaleDTO> fields, InnerBcDescription bcDescription, Long parentId) {
		fields.setForceActive(SaleDTO_.selDayFlg);
		fields.enableFilter(SaleDTO_.selDayFlg);
		fields.setForceActive(SaleDTO_.macroProduct);
		fields.setForceActive(SaleDTO_.reqProductId);
		fields.setForceActive(SaleDTO_.reqProduct);
		fields.setForceActive(SaleDTO_.cardCategory);
		fields.setForceActive(SaleDTO_.typeCalc);
		fields.setForceActive(SaleDTO_.customRateFlg);
		fields.setForceActive(SaleDTO_.reducedPaymentFlag);

		fields.setEnumValues(SaleDTO_.macroProduct, MacroProduct.values());
		fields.enableFilter(SaleDTO_.sumCreditAdditionalServices);
		fields.enableFilter(SaleDTO_.pskPercentCrics);
		fields.enableFilter(SaleDTO_.resAmount);
		fields.enableFilter(SaleDTO_.approvedAmount);
		fields.enableFilter(SaleDTO_.pskPercent);
		fields.enableFilter(SaleDTO_.overpaymentAmountPercent);
		fields.enableFilter(SaleDTO_.overpaymentAmount);
		fields.enableFilter(SaleDTO_.overpaymentAmountDay);
		fields.enableFilter(SaleDTO_.amountHandWithoutInsurance);
		fields.enableFilter(SaleDTO_.reducedPaymentTerm);
		fields.enableFilter(SaleDTO_.reducedPayment);
		fields.enableFilter(SaleDTO_.reducedPaymentFlag);
		fields.enableFilter(SaleDTO_.reqRate);
		fields.enableFilter(SaleDTO_.customRateFlg);
		fields.enableFilter(SaleDTO_.selDayFlg);
		fields.setEnumFilterValues(fields, SaleDTO_.paymentDate, PaymentDateEnum.values());
		fields.enableFilter(SaleDTO_.paymentDate);
		fields.setEnumFilterValues(fields, SaleDTO_.reqCurrency, ReqCurrencyEnum.values());
		fields.enableFilter(SaleDTO_.reqCurrency);
		fields.enableFilter(SaleDTO_.reqTerm);
		fields.enableFilter(SaleDTO_.reqPayment);
		fields.enableFilter(SaleDTO_.reqAmount);
		fields.setEnumFilterValues(fields, SaleDTO_.typeCalc, TypeCalcEnum.values());
		fields.enableFilter(SaleDTO_.typeCalc);
		fields.enableFilter(SaleDTO_.cardHint);
		fields.enableFilter(SaleDTO_.emptyField);
		fields.enableFilter(SaleDTO_.cardCommissionThirdYear);
		fields.enableFilter(SaleDTO_.tariffMinMonthPayment);
		fields.setEnumFilterValues(fields, SaleDTO_.cardCategory, CardCategoryEnum.values());
		fields.enableFilter(SaleDTO_.cardCategory);
		fields.setEnumFilterValues(fields, SaleDTO_.collateralAvailability, CollateralAvailabilityEnum.values());
		fields.enableFilter(SaleDTO_.collateralAvailability);
	}

}
