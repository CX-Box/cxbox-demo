package org.demo.service;

import org.demo.dto.SaleDTO;
import org.demo.dto.SaleDTO_;
import org.demo.entity.enums.CardCategoryEnum;
import org.demo.entity.enums.CollateralAvailabilityEnum;
import org.demo.entity.enums.PaymentDateEnum;
import org.demo.entity.enums.Product;
import org.demo.entity.enums.ReqCurrencyEnum;
import org.demo.entity.enums.SaleStatus;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.entity.enums.TypeCalcEnum;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class SaleWriteMeta extends FieldMetaBuilder<SaleDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<SaleDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(SaleDTO_.reducedPaymentTerm);
		fields.setEnabled(SaleDTO_.reducedPayment);
		fields.setEnabled(SaleDTO_.reducedPaymentFlag);
		fields.setEnabled(SaleDTO_.reqRate);
		fields.setEnabled(SaleDTO_.customRateFlg);
		fields.setEnabled(SaleDTO_.rBSelectDayFlag);
		fields.setEnumValues(SaleDTO_.paymentDate, PaymentDateEnum.values());
		fields.setEnabled(SaleDTO_.paymentDate);
		fields.setEnumValues(SaleDTO_.reqCurrency, ReqCurrencyEnum.values());
		fields.setEnabled(SaleDTO_.reqCurrency);
		fields.setEnabled(SaleDTO_.reqTerm);
		fields.setEnabled(SaleDTO_.reqPayment);
		fields.setEnabled(SaleDTO_.reqAmount);
		fields.setEnumValues(SaleDTO_.typeCalc, TypeCalcEnum.values());
		fields.setEnabled(SaleDTO_.typeCalc);
		fields.setEnabled(SaleDTO_.cardHint);
		fields.setEnabled(SaleDTO_.emptyField);
		fields.setEnabled(SaleDTO_.cardCommissionThirdYear);
		fields.setEnabled(SaleDTO_.tariffMinMonthPayment);
		fields.setEnumValues(SaleDTO_.cardCategory, CardCategoryEnum.values());
		fields.setEnabled(SaleDTO_.cardCategory);
		fields.setEnumValues(SaleDTO_.collateralAvailability, CollateralAvailabilityEnum.values());
		fields.setEnabled(SaleDTO_.collateralAvailability);

		fields.setEnabled(
				SaleDTO_.clientName,
				SaleDTO_.clientId,
				SaleDTO_.macroProduct,
				SaleDTO_.status,
				SaleDTO_.sum
		);

		fields.setRequired(
				SaleDTO_.clientName,
				SaleDTO_.clientId,
				SaleDTO_.macroProduct,
				SaleDTO_.status,
				SaleDTO_.sum
		);

		fields.setEnumValues(SaleDTO_.macroProduct, Product.values());
		fields.setEnumValues(SaleDTO_.status, SaleStatus.values());

	}


	@Override
	public void buildIndependentMeta(FieldsMeta<SaleDTO> fields, InnerBcDescription bcDescription, Long parentId) {
		fields.enableFilter(SaleDTO_.reducedPaymentTerm);
		fields.enableFilter(SaleDTO_.reducedPayment);
		fields.enableFilter(SaleDTO_.reducedPaymentFlag);
		fields.enableFilter(SaleDTO_.reqRate);
		fields.enableFilter(SaleDTO_.customRateFlg);
		fields.enableFilter(SaleDTO_.rBSelectDayFlag);
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
