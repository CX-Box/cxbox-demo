package org.demo.dto;

import java.time.LocalDateTime;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.BigDecimalValueProvider;
import org.cxbox.core.util.filter.provider.impl.BooleanValueProvider;
import org.cxbox.core.util.filter.provider.impl.DateValueProvider;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.demo.entity.Product;
import org.cxbox.api.data.dto.DataResponseDTO;
import java.time.format.DateTimeFormatter;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.demo.entity.enums.CategoryGroupEnum;
import org.demo.entity.enums.ExpireDateUnitEnum;
import org.demo.entity.enums.CategoryGroupGeneralEnum;
import org.demo.entity.enums.CurrencyEnum;
import org.demo.entity.enums.GBCLimitOperationTypeEnum;
import org.demo.entity.enums.IncomeConfirmTypeEnum;
import org.demo.entity.enums.InsuranceTypeAdmEnum;
import org.demo.entity.enums.MacroProduct;
import org.demo.entity.enums.PledgeTypeEnum;
import org.demo.entity.enums.PreapproveProductEnum;
import org.demo.entity.enums.RBNamedCardIssueAvailabilityEnum;
import org.demo.entity.enums.RiskSegmentEnum;
import org.demo.entity.enums.StatusEnum;

@Getter
@Setter
@NoArgsConstructor
public class ProductDTO extends DataResponseDTO {

	private String shortName;

	@SearchParameter(name = "siebelId", provider = StringValueProvider.class)
	private String siebelId;

	@SearchParameter(name = "productCode", provider = StringValueProvider.class)
	private String productCode;

	@SearchParameter(name = "macroProduct", provider = EnumValueProvider.class)
	private MacroProduct macroProduct;

	@SearchParameter(name = "status", provider = EnumValueProvider.class)
	private StatusEnum status;

	@SearchParameter(name = "startDate", provider = DateValueProvider.class)
	private LocalDateTime startDate;

	@SearchParameter(name = "endDate", provider = DateValueProvider.class)
	private LocalDateTime endDate;

	@SearchParameter(name = "version", provider = BigDecimalValueProvider.class)
	private Long version;

	@SearchParameter(name = "nonStandartFlag", provider = BooleanValueProvider.class)
	private Boolean nonStandartFlag;

	@SearchParameter(name = "notDSA", provider = BooleanValueProvider.class)
	private Boolean notDSA;

	@SearchParameter(name = "gBCCheckedFlg", provider = BooleanValueProvider.class)
	private Boolean gBCCheckedFlg;

	@SearchParameter(name = "maxDeviateAmount", provider = BigDecimalValueProvider.class)
	private Long maxDeviateAmount;

	@SearchParameter(name = "convertationCorrectionCodeBIS", provider = StringValueProvider.class)
	private String convertationCorrectionCodeBIS;

	@SearchParameter(name = "riskGroupBIS", provider = StringValueProvider.class)
	private String riskGroupBIS;

	@SearchParameter(name = "loanTypeBIS", provider = StringValueProvider.class)
	private String loanTypeBIS;

	@SearchParameter(name = "rMReviewDate", provider = BigDecimalValueProvider.class)
	private Long rMReviewDate;

	@SearchParameter(name = "riskSegment", provider = EnumValueProvider.class)
	private RiskSegmentEnum riskSegment;

	@SearchParameter(name = "preapproveProduct", provider = EnumValueProvider.class)
	private PreapproveProductEnum preapproveProduct;

	@SearchParameter(name = "currency.value", multiFieldKey = StringValueProvider.class)
	private MultivalueField currency;

	@SearchParameter(name = "defaultCurrency", provider = EnumValueProvider.class)
	private CurrencyEnum defaultCurrency;

	@SearchParameter(name = "ratioLoanDepositTerm", provider = BigDecimalValueProvider.class)
	private Long ratioLoanDepositTerm;

	@SearchParameter(name = "incomeConfirmType.value", multiFieldKey = StringValueProvider.class)
	private MultivalueField incomeConfirmType;

	@SearchParameter(name = "pledgeType.value", multiFieldKey = StringValueProvider.class)
	private MultivalueField pledgeType;

	@SearchParameter(name = "pledgeNumMax", provider = BigDecimalValueProvider.class)
	private Long pledgeNumMax;

	@SearchParameter(name = "guarantorNumMax", provider = BigDecimalValueProvider.class)
	private Long guarantorNumMax;

	@SearchParameter(name = "guarantorNumMin", provider = BigDecimalValueProvider.class)
	private Long guarantorNumMin;

	@SearchParameter(name = "pledgeNumMin", provider = BigDecimalValueProvider.class)
	private Long pledgeNumMin;

	@SearchParameter(name = "categoryGroupGeneral", provider = EnumValueProvider.class)
	private CategoryGroupGeneralEnum categoryGroupGeneral;

	@SearchParameter(name = "gBCLimitOperationType", provider = EnumValueProvider.class)
	private GBCLimitOperationTypeEnum gBCLimitOperationType;

	@SearchParameter(name = "offerExpireDate", provider = BigDecimalValueProvider.class)
	private Long offerExpireDate;

	@SearchParameter(name = "offerExpireDateUnit", provider = EnumValueProvider.class)
	private ExpireDateUnitEnum offerExpireDateUnit;

	@SearchParameter(name = "acceptExpireDate", provider = BigDecimalValueProvider.class)
	private Long acceptExpireDate;

	@SearchParameter(name = "acceptExpireDateUnit", provider = EnumValueProvider.class)
	private ExpireDateUnitEnum acceptExpireDateUnit;

	@SearchParameter(name = "rBValidityPeriod", provider = BigDecimalValueProvider.class)
	private Long rBValidityPeriod;

	@SearchParameter(name = "spouseTotalIncomeFlg", provider = BooleanValueProvider.class)
	private Boolean spouseTotalIncomeFlg;

	@SearchParameter(name = "reducedPaymentFlg", provider = BooleanValueProvider.class)
	private Boolean reducedPaymentFlg;

	@SearchParameter(name = "rBNamedCardIssueAvailability", provider = EnumValueProvider.class)
	private RBNamedCardIssueAvailabilityEnum rBNamedCardIssueAvailability;

	@SearchParameter(name = "vIPAvailableFlag", provider = BooleanValueProvider.class)
	private Boolean vIPAvailableFlag;

	@SearchParameter(name = "instantCardIssueFlg", provider = BooleanValueProvider.class)
	private Boolean instantCardIssueFlg;

	@SearchParameter(name = "annuityDeviationCrCur", provider = BigDecimalValueProvider.class)
	private Long annuityDeviationCrCur;

	@SearchParameter(name = "annuityDeviationPercent", provider = BigDecimalValueProvider.class)
	private Long annuityDeviationPercent;

	@SearchParameter(name = "fixedPaymentDateFlag", provider = BooleanValueProvider.class)
	private Boolean fixedPaymentDateFlag;

	@SearchParameter(name = "insuranceTypeAdm.value", multiFieldKey = StringValueProvider.class)
	private MultivalueField insuranceTypeAdm;

	@SearchParameter(name = "fullName", provider = StringValueProvider.class)
	private String fullName;

	@SearchParameter(name = "categoryGroup", provider = EnumValueProvider.class)
	private CategoryGroupEnum categoryGroup;

	public ProductDTO(Product entity) {
		DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy hh:mm");
		this.id = entity.getId().toString();
		this.shortName = entity.getShortName();
		this.siebelId = entity.getSiebelId();
		this.productCode = entity.getProductCode();
		this.macroProduct = entity.getMacroProduct();
		this.status = entity.getStatus();
		this.startDate = entity.getStartDate();
		this.endDate = entity.getEndDate();
		this.version = entity.getVersion();
		this.nonStandartFlag = entity.getNonStandartFlag();
		this.notDSA = entity.getNotDSA();
		this.gBCCheckedFlg = entity.getGBCCheckedFlg();
		this.maxDeviateAmount = entity.getMaxDeviateAmount();
		this.convertationCorrectionCodeBIS = entity.getConvertationCorrectionCodeBIS();
		this.riskGroupBIS = entity.getRiskGroupBIS();
		this.loanTypeBIS = entity.getLoanTypeBIS();
		this.rMReviewDate = entity.getRMReviewDate();
		this.riskSegment = entity.getRiskSegment();
		this.preapproveProduct = entity.getPreapproveProduct();
		this.currency = entity.getCurrency().stream()
				.collect(MultivalueField.toMultivalueField(Enum::name, CurrencyEnum::getValue));
		this.defaultCurrency = entity.getDefaultCurrency();
		this.ratioLoanDepositTerm = entity.getRatioLoanDepositTerm();
		this.incomeConfirmType = entity.getIncomeConfirmType().stream()
				.collect(MultivalueField.toMultivalueField(Enum::name, IncomeConfirmTypeEnum::getValue));
		this.pledgeType = entity.getPledgeType().stream()
				.collect(MultivalueField.toMultivalueField(Enum::name, PledgeTypeEnum::getValue));
		this.pledgeNumMax = entity.getPledgeNumMax();
		this.guarantorNumMax = entity.getGuarantorNumMax();
		this.guarantorNumMin = entity.getGuarantorNumMin();
		this.pledgeNumMin = entity.getPledgeNumMin();
		this.categoryGroupGeneral = entity.getCategoryGroupGeneral();
		this.gBCLimitOperationType = entity.getGBCLimitOperationType();
		this.offerExpireDate = entity.getOfferExpireDate();
		this.acceptExpireDate = entity.getAcceptExpireDate();
		this.offerExpireDateUnit = entity.getOfferExpireDateUnit();
		this.acceptExpireDateUnit = entity.getAcceptExpireDateUnit();
		this.rBValidityPeriod = entity.getRBValidityPeriod();
		this.spouseTotalIncomeFlg = entity.getSpouseTotalIncomeFlg();
		this.reducedPaymentFlg = entity.getReducedPaymentFlg();
		this.rBNamedCardIssueAvailability = entity.getRBNamedCardIssueAvailability();
		this.vIPAvailableFlag = entity.getVIPAvailableFlag();
		this.instantCardIssueFlg = entity.getInstantCardIssueFlg();
		this.annuityDeviationCrCur = entity.getAnnuityDeviationCrCur();
		this.annuityDeviationPercent = entity.getAnnuityDeviationPercent();
		this.fixedPaymentDateFlag = entity.getFixedPaymentDateFlag();
		this.insuranceTypeAdm = entity.getInsuranceTypeAdm().stream()
				.collect(MultivalueField.toMultivalueField(Enum::name, InsuranceTypeAdmEnum::getValue));
		this.fullName = entity.getFullName();
		this.categoryGroup = entity.getCategoryGroup();
	}

}
