package org.demo.dto;

import java.util.Optional;
import org.cxbox.core.util.filter.provider.impl.BigDecimalValueProvider;
import org.cxbox.core.util.filter.provider.impl.BooleanValueProvider;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.demo.entity.Sale;
import org.demo.entity.enums.CardCategoryEnum;
import org.demo.entity.enums.CollateralAvailabilityEnum;
import org.demo.entity.enums.MacroProduct;
import org.demo.entity.enums.PaymentDateEnum;
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

	@SearchParameter(name = "macroProduct", provider = EnumValueProvider.class)
	private MacroProduct macroProduct;

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
	private Double reqAmount;

	private Double requestedAmount;

	@SearchParameter(name = "reqPayment", provider = BigDecimalValueProvider.class)
	private Double reqPayment;

	@SearchParameter(name = "reqTerm", provider = BigDecimalValueProvider.class)
	private Long reqTerm;

	@SearchParameter(name = "reqCurrency", provider = EnumValueProvider.class)
	private ReqCurrencyEnum reqCurrency;

	//[Macroproduct] IS NOT NULL AND NOT([Macroproduct NPK MFO Flg]='Y' OR [Macroproduct] = LookupValue('ATC_MACROPRODUCT','Refinance') OR ([Macroproduct]=LookupValue('ATC_MACROPRODUCT','NCC') AND [RB Select Day Flag]))
	@SearchParameter(name = "paymentDate", provider = EnumValueProvider.class)
	private PaymentDateEnum paymentDate;

	//[Macroproduct]=LookupValue('ATC_MACROPRODUCT','NCC')
	@SearchParameter(name = "selDayFlg", provider = BooleanValueProvider.class)
	private Boolean selDayFlg;

	//RO3 = InList(LookupName("POSITION_TYPE", GetProfileAttr("Primary Position Type")),"Head,Supervisor CS,Supervisor Sales,Operator CS,Operator Sales")
	//Custom Rate Flg RO=[Opty Offer Id] IS NOT NULL OR EAILookUpExternal("ATC_CONSTANT","ATC Nonstandard Flag","") = 'Y' OR [Opty Stage] = LookupValue("ATC_OPTY_STAGE", "LoanOffer") OR [DSA Position]='Y'
	//[Custom Rate Flg RO Common]=[Custom Rate Flg RO] OR [Custom Rate Flg RO 3] OR ([Macroproduct]=LookupValue('ATC_MACROPRODUCT','Refinance') AND LookupValue("ATC_CNST_REFIN","Check Refin") = 'Y')
	//IIF([VIP Flg]="N",[Custom Rate Flg RO Common],[Custom Rate Flg RO VIP]) OR [Extra Product Flag] = 'Y'
	@SearchParameter(name = "customRateFlg", provider = BooleanValueProvider.class)
	private Boolean customRateFlg;

	@SearchParameter(name = "reqRate", provider = BigDecimalValueProvider.class)
	private Long reqRate;


	//([Product Reduced Payment Flg] <> "Y" OR [Product Reduced Payment Flg] IS  NULL) OR NOT([Opty Stage] IS NULL OR [Full Stage Calc] = "Y" OR [Short Stage Calc] = "Y" OR [Loan Offer Edit Calc RO]="N")
	@SearchParameter(name = "reducedPaymentFlag", provider = BooleanValueProvider.class)
	private Boolean reducedPaymentFlag;

	@SearchParameter(name = "reducedPayment", provider = BigDecimalValueProvider.class)
	private Long reducedPayment;

	@SearchParameter(name = "reducedPaymentTerm", provider = BigDecimalValueProvider.class)
	private Long reducedPaymentTerm;

	@SearchParameter(name = "amountHandWithoutInsurance", provider = BigDecimalValueProvider.class)
	private Long amountHandWithoutInsurance;

	@SearchParameter(name = "overpaymentAmountDay", provider = BigDecimalValueProvider.class)
	private Long overpaymentAmountDay;

	@SearchParameter(name = "overpaymentAmount", provider = BigDecimalValueProvider.class)
	private Long overpaymentAmount;

	@SearchParameter(name = "overpaymentAmountPercent", provider = BigDecimalValueProvider.class)
	private Long overpaymentAmountPercent;

	@SearchParameter(name = "pSKPercent", provider = BigDecimalValueProvider.class)
	private Long pskPercent;

	@SearchParameter(name = "approvedAmount", provider = BigDecimalValueProvider.class)
	private Long approvedAmount;

	private Long rbRefinApprovedAmount;

	@SearchParameter(name = "resAmount", provider = BigDecimalValueProvider.class)
	private Long resAmount;

	@SearchParameter(name = "pSKPercentCrics", provider = BigDecimalValueProvider.class)
	private Long pskPercentCrics;

	@SearchParameter(name = "sumCreditAdditionalServices", provider = BigDecimalValueProvider.class)
	private Long sumCreditAdditionalServices;

	@SearchParameter(name = "reqProduct", provider = StringValueProvider.class)
	private String reqProduct;

	private Long reqProductId;

	public SaleDTO(Sale sale) {
		this.id = sale.getId().toString();
		this.clientName = sale.getClient() == null ? null : sale.getClient().getFullName();
		this.macroProduct = sale.getMacroproduct();
		this.status = sale.getStatus();
		this.sum = sale.getSum();
		this.collateralAvailability = sale.getCollateralAvailability();
		this.cardCategory = sale.getCardCategory();
		this.tariffMinMonthPayment = sale.getTariffMinMonthPayment();
		this.cardCommissionThirdYear = sale.getCardCommissionThirdYear();
		this.typeCalc = sale.getTypeCalc();
		this.reqAmount = sale.getReqAmount();
		this.requestedAmount = this.reqAmount; //IIF([Opty Id] IS NULL, [Req Amount], [Requested Calc Amount]), where 'Requested Calculation' join REQ_AMOUNT column of CX_OPTY_CALC on 'Requested Calc Id' = CX_OPTY_CALC.id where 'Requested Calc Id' is X_REQ_CALC_ID from 'opty' join of 'ATC Calc' bc
		this.reqPayment = sale.getReqPayment();
		this.reqTerm = sale.getReqTerm();
		this.reqCurrency = sale.getReqCurrency();
		this.paymentDate = sale.getPaymentDate();
		this.customRateFlg = sale.getCustomRateFlg();
		this.reqRate = sale.getReqRate();
		this.reducedPaymentFlag = sale.getReducedPaymentFlag();
		this.reducedPayment = sale.getReducedPayment();
		this.reducedPaymentTerm = sale.getReducedPaymentTerm();
		this.amountHandWithoutInsurance = sale.getAmountHandWithoutInsurance();
		this.overpaymentAmountDay = sale.getOverpaymentAmountDay();
		this.overpaymentAmount = sale.getOverpaymentAmount();
		this.overpaymentAmountPercent = sale.getOverpaymentAmountPercent();
		this.pskPercent = sale.getPSKPercent();
		this.approvedAmount = sale.getApprovedAmount();
		this.resAmount = sale.getResAmount();
		this.pskPercentCrics = sale.getPSKPercentCrics();
		this.sumCreditAdditionalServices = 0L; //Sum([Credit Additional Services]), where sum on col Cost of bc 'ATC Credit Additional Services' where Selected Flg=Y reference by 'ATC Credit Additional Services'.'Calc Id'='ATC Calc'.'Id'
		this.rbRefinApprovedAmount = approvedAmount;
		this.reqProductId = Optional.ofNullable(sale.getReqProduct())
				.map(e -> e.getId())
				.orElse(null);
		this.reqProduct = Optional.ofNullable(sale.getReqProduct())
				.map(e -> e.getShortName())
				.orElse(null);
		this.selDayFlg = sale.getSelDayFlg();
	}

}
