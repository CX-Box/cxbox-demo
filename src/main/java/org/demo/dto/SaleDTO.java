package org.demo.dto;

import org.cxbox.core.util.filter.provider.impl.BigDecimalValueProvider;
import org.cxbox.core.util.filter.provider.impl.BooleanValueProvider;
import org.demo.entity.Sale;
import org.demo.entity.enums.CardCategoryEnum;
import org.demo.entity.enums.CollateralAvailabilityEnum;
import org.demo.entity.enums.PaymentDateEnum;
import org.demo.entity.enums.Product;
import org.demo.entity.enums.ReqCurrencyEnum;
import org.demo.entity.enums.SaleStatus;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.demo.entity.enums.TypeCalcEnum;

@Getter
@Setter
@NoArgsConstructor
public class SaleDTO extends DataResponseDTO {

	@SearchParameter(name = "client.fullName")
	private String clientName;

	private Long clientId;

	@SearchParameter(name = "product", provider = EnumValueProvider.class)
	private Product macroProduct;

	@SearchParameter(name = "status", provider = EnumValueProvider.class)
	private SaleStatus status;

	private Long sum;

	@SearchParameter(name = "collateralAvailability", provider = EnumValueProvider.class)
	private CollateralAvailabilityEnum collateralAvailability;

	@SearchParameter(name = "cardCategory", provider = EnumValueProvider.class)
	private CardCategoryEnum cardCategory;

	@SearchParameter(name = "tariffMinMonthPayment", provider = BigDecimalValueProvider.class)
	private Long tariffMinMonthPayment;

	@SearchParameter(name = "cardCommissionThirdYear", provider = BigDecimalValueProvider.class)
	private Long cardCommissionThirdYear;

	private String emptyField = "";

	private String cardHint = "__________________________________";

	@SearchParameter(name = "typeCalc", provider = EnumValueProvider.class)
	private TypeCalcEnum typeCalc;

	@SearchParameter(name = "reqAmount", provider = BigDecimalValueProvider.class)
	private Long reqAmount;

	@SearchParameter(name = "reqPayment", provider = BigDecimalValueProvider.class)
	private Long reqPayment;

	@SearchParameter(name = "reqTerm", provider = BigDecimalValueProvider.class)
	private Long reqTerm;

	@SearchParameter(name = "reqCurrency", provider = EnumValueProvider.class)
	private ReqCurrencyEnum reqCurrency;

	@SearchParameter(name = "paymentDate", provider = EnumValueProvider.class)
	private PaymentDateEnum paymentDate;

	@SearchParameter(name = "rBSelectDayFlag", provider = BooleanValueProvider.class)
	private Boolean rBSelectDayFlag;

	@SearchParameter(name = "customRateFlg", provider = BooleanValueProvider.class)
	private Boolean customRateFlg;

	@SearchParameter(name = "reqRate", provider = BigDecimalValueProvider.class)
	private Long reqRate;

	@SearchParameter(name = "reducedPaymentFlag", provider = BooleanValueProvider.class)
	private Boolean reducedPaymentFlag;

	@SearchParameter(name = "reducedPayment", provider = BigDecimalValueProvider.class)
	private Long reducedPayment;

	@SearchParameter(name = "reducedPaymentTerm", provider = BigDecimalValueProvider.class)
	private Long reducedPaymentTerm;

	public SaleDTO(Sale sale) {
		this.id = sale.getId().toString();
		this.clientName = sale.getClient() == null ? null : sale.getClient().getFullName();
		this.macroProduct = sale.getProduct();
		this.status = sale.getStatus();
		this.sum = sale.getSum();
		this.collateralAvailability = sale.getCollateralAvailability();
		this.cardCategory = sale.getCardCategory();
		this.tariffMinMonthPayment = sale.getTariffMinMonthPayment();
		this.cardCommissionThirdYear = sale.getCardCommissionThirdYear();
		//this.hintTest = sale.getHintTest();
		//this.cardHint = sale.getCardHint();
		this.typeCalc = sale.getTypeCalc();
		this.reqAmount = sale.getReqAmount();
		this.reqPayment = sale.getReqPayment();
		this.reqTerm = sale.getReqTerm();
		this.reqCurrency = sale.getReqCurrency();
		this.paymentDate = sale.getPaymentDate();
		this.rBSelectDayFlag = sale.getRBSelectDayFlag();
		this.customRateFlg = sale.getCustomRateFlg();
		this.reqRate = sale.getReqRate();
		this.reducedPaymentFlag = sale.getReducedPaymentFlag();
		this.reducedPayment = sale.getReducedPayment();
		this.reducedPaymentTerm = sale.getReducedPaymentTerm();
	}

}
