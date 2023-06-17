package org.demo.dto;

import com.google.common.base.Splitter;
import java.util.Optional;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.BigDecimalValueProvider;
import org.cxbox.core.util.filter.provider.impl.BooleanValueProvider;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.demo.entity.MatrixItem;
import org.demo.entity.enums.ATCScheduleTypeEnum;
import org.demo.entity.enums.AttractionCloseChannelEnum;
import org.demo.entity.enums.CardCategoryEnum;
import org.demo.entity.enums.CardTypeEnum;
import org.demo.entity.enums.CategoryGroupEnum;
import org.demo.entity.enums.CategoryGroupGeneralEnum;
import org.demo.entity.enums.CurrencyEnum;
import org.demo.entity.enums.EmployerCategoryEnum;
import org.demo.entity.enums.GBCLoanCategoryEnum;
import org.demo.entity.enums.IncomeConfirmTypeEnum;
import org.demo.entity.enums.InsuranceTypeAdmEnum;
import org.demo.entity.enums.MarketingSegment1Enum;
import org.demo.entity.enums.MarketingSegment2Enum;
import org.demo.entity.enums.MarketingSegment3Enum;
import org.demo.entity.enums.MarketingSegment4Enum;
import org.demo.entity.enums.MatrixTypeEnum;
import org.demo.entity.enums.ParticipantTypesEnum;
import org.demo.entity.enums.ProofOfIncomeEnum;
import org.demo.entity.enums.ProofOfIncomeEnum;
import org.demo.entity.enums.TargetOpenSystemEnum;
import org.demo.entity.enums.YesNoEnum;
import org.demo.entity.enums.RiskSegmentEnum;
import org.demo.entity.enums.TariffCodeEnum;

@Getter
@Setter
@NoArgsConstructor
public class MatrixItemDTO extends DataResponseDTO {


	@SearchParameter(name = "siebelId", provider = StringValueProvider.class)
	private String siebelId;

	@SearchParameter(name = "priority", provider = BigDecimalValueProvider.class)
	private Long priority;

	@SearchParameter(name = "currency.value", multiFieldKey = StringValueProvider.class)
	private MultivalueField currency;

	@SearchParameter(name = "participantTypes", multiFieldKey = StringValueProvider.class)
	private MultivalueField participantTypes;

	@SearchParameter(name = "attractionCloseChannel", multiFieldKey = StringValueProvider.class)
	private MultivalueField attractionCloseChannel;

	@SearchParameter(name = "tariffCode", multiFieldKey = StringValueProvider.class)
	private MultivalueField tariffCode;

	@SearchParameter(name = "employerCategory", multiFieldKey = StringValueProvider.class)
	private MultivalueField employerCategory;

	@SearchParameter(name = "riskSegment", multiFieldKey = StringValueProvider.class)
	private MultivalueField riskSegment;

	@SearchParameter(name = "categoryGroupGeneral", multiFieldKey = StringValueProvider.class)
	private MultivalueField categoryGroupGeneral;

	@SearchParameter(name = "categoryGroup", multiFieldKey = StringValueProvider.class)
	private MultivalueField categoryGroup;

	@SearchParameter(name = "salaryClient", multiFieldKey = StringValueProvider.class)
	private MultivalueField salaryClient;

	@SearchParameter(name = "marketingSegment1", multiFieldKey = StringValueProvider.class)
	private MultivalueField marketingSegment1;

	@SearchParameter(name = "marketingSegment2", multiFieldKey = StringValueProvider.class)
	private MultivalueField marketingSegment2;

	@SearchParameter(name = "marketingSegment3", multiFieldKey = StringValueProvider.class)
	private MultivalueField marketingSegment3;

	@SearchParameter(name = "marketingSegment4", multiFieldKey = StringValueProvider.class)
	private MultivalueField marketingSegment4;

	@SearchParameter(name = "incomeConfirmDocumentType", multiFieldKey = StringValueProvider.class)
	private MultivalueField incomeConfirmDocumentType;

	@SearchParameter(name = "insuranceType", multiFieldKey = StringValueProvider.class)
	private MultivalueField insuranceType;

	@SearchParameter(name = "rBSubsequentPledgeFlag", multiFieldKey = StringValueProvider.class)
	private MultivalueField rBSubsequentPledgeFlag;

	@SearchParameter(name = "hasCollateralFlg", provider = BooleanValueProvider.class)
	private Boolean hasCollateralFlg;

	@SearchParameter(name = "cardType", multiFieldKey = StringValueProvider.class)
	private MultivalueField cardType;

	@SearchParameter(name = "cardCategory", multiFieldKey = StringValueProvider.class)
	private MultivalueField cardCategory;

	@SearchParameter(name = "minTermMonths", provider = BigDecimalValueProvider.class)
	private Long minTermMonths;

	@SearchParameter(name = "maxTermMonths", provider = BigDecimalValueProvider.class)
	private Long maxTermMonths;

	@SearchParameter(name = "minSum", provider = BigDecimalValueProvider.class)
	private Double minSum;

	@SearchParameter(name = "maxSum", provider = BigDecimalValueProvider.class)
	private Double maxSum;

	@SearchParameter(name = "gBCLoanCategory", multiFieldKey = StringValueProvider.class)
	private MultivalueField gBCLoanCategory;

	@SearchParameter(name = "proofOfIncome", multiFieldKey = StringValueProvider.class)
	private MultivalueField proofOfIncome;

	@SearchParameter(name = "tariffVersionPF", provider = StringValueProvider.class)
	private String tariffVersionPF;

	@SearchParameter(name = "tariffNamePf", provider = StringValueProvider.class)
	private String tariffNamePf;

	@SearchParameter(name = "dismissTariffNamePf", provider = StringValueProvider.class)
	private String dismissTariffNamePf;

	@SearchParameter(name = "ratePercent", provider = BigDecimalValueProvider.class)
	private Double ratePercent;

	@SearchParameter(name = "cashCreditRate", provider = BigDecimalValueProvider.class)
	private Double cashCreditRate;

	@SearchParameter(name = "specCondRate", provider = BigDecimalValueProvider.class)
	private Double specCondRate;

	@SearchParameter(name = "minPercentRate", provider = BigDecimalValueProvider.class)
	private Double minPercentRate;

	@SearchParameter(name = "minMonthlyPaymentForMainDebt", provider = BigDecimalValueProvider.class)
	private Double minMonthlyPaymentForMainDebt;

	@SearchParameter(name = "minMounthPayment", provider = BigDecimalValueProvider.class)
	private Double minMounthPayment;

	@SearchParameter(name = "cashCommissionOverdraft", provider = BigDecimalValueProvider.class)
	private Double cashCommissionOverdraft;

	@SearchParameter(name = "penaltiesForPaymDelayPf", provider = StringValueProvider.class)
	private String penaltiesForPaymDelayPf;

	@SearchParameter(name = "penaltiesForNoCascoPf", provider = StringValueProvider.class)
	private String penaltiesForNoCascoPf;

	@SearchParameter(name = "paymentScheme", provider = StringValueProvider.class)
	private String paymentScheme;

	@SearchParameter(name = "gracePeriodMonth", provider = BigDecimalValueProvider.class)
	private Long gracePeriodMonth;

	@SearchParameter(name = "maxDelayTerm", provider = BigDecimalValueProvider.class)
	private Long maxDelayTerm;

	@SearchParameter(name = "minDelayTerm", provider = BigDecimalValueProvider.class)
	private Long minDelayTerm;

	@SearchParameter(name = "delayToLoanTerm", provider = BigDecimalValueProvider.class)
	private Long delayToLoanTerm;

	@SearchParameter(name = "aTCScheduleType", provider = EnumValueProvider.class)
	private ATCScheduleTypeEnum aTCScheduleType;

	@SearchParameter(name = "movePaymentDateFlg", provider = BooleanValueProvider.class)
	private Boolean movePaymentDateFlg;

	@SearchParameter(name = "cardIssueCommission", provider = BigDecimalValueProvider.class)
	private Double cardIssueCommission;

	@SearchParameter(name = "instantCardCommission", provider = BigDecimalValueProvider.class)
	private Double instantCardCommission;

	@SearchParameter(name = "onetimeCardCommission", provider = BigDecimalValueProvider.class)
	private Double onetimeCardCommission;

	@SearchParameter(name = "minCardServiceCommission", provider = BigDecimalValueProvider.class)
	private Double minCardServiceCommission;

	@SearchParameter(name = "maxCardServiceCommission", provider = BigDecimalValueProvider.class)
	private Double maxCardServiceCommission;

	@SearchParameter(name = "fstYrCardCommission", provider = BigDecimalValueProvider.class)
	private Double fstYrCardCommission;

	@SearchParameter(name = "secondYrCardCommission", provider = BigDecimalValueProvider.class)
	private Double secondYrCardCommission;

	@SearchParameter(name = "thirdYrCard", provider = BigDecimalValueProvider.class)
	private Double thirdYrCard;

	@SearchParameter(name = "fstYrCardCommissionPF", provider = StringValueProvider.class)
	private String fstYrCardCommissionPF;

	@SearchParameter(name = "secondYrCardCommissionPF", provider = StringValueProvider.class)
	private String secondYrCardCommissionPF;

	@SearchParameter(name = "thirdYrCardCommissionPF", provider = StringValueProvider.class)
	private String thirdYrCardCommissionPF;

	@SearchParameter(name = "cashCommission", provider = StringValueProvider.class)
	private String cashCommission;

	@SearchParameter(name = "othbankMoneyComission", provider = StringValueProvider.class)
	private String othbankMoneyComission;

	@SearchParameter(name = "bISCardProductCode", provider = StringValueProvider.class)
	private String bISCardProductCode;

	@SearchParameter(name = "binRange", provider = StringValueProvider.class)
	private String binRange;

	@SearchParameter(name = "cardTariffCode", provider = StringValueProvider.class)
	private String cardTariffCode;

	@SearchParameter(name = "limitOperationSum", provider = BigDecimalValueProvider.class)
	private Double limitOperationSum;

	@SearchParameter(name = "aRTProductCode", provider = StringValueProvider.class)
	private String aRTProductCode;

	@SearchParameter(name = "maxPDN", provider = BigDecimalValueProvider.class)
	private Double maxPDN;

	@SearchParameter(name = "minPDN", provider = BigDecimalValueProvider.class)
	private Double minPDN;

	@SearchParameter(name = "bISLoanCategory", provider = StringValueProvider.class)
	private String bISLoanCategory;

	@SearchParameter(name = "targetOpenSystem", provider = EnumValueProvider.class)
	private TargetOpenSystemEnum targetOpenSystem;

	@SearchParameter(name = "rfResidentRequired", provider = BooleanValueProvider.class)
	private Boolean rfResidentRequired;

	@SearchParameter(name = "bankDivnJobAddress", provider = BooleanValueProvider.class)
	private Boolean bankDivnJobAddress;

	@SearchParameter(name = "bankDivnResidency", provider = BooleanValueProvider.class)
	private Boolean bankDivnResidency;

	@SearchParameter(name = "additionalIDRequired", provider = BooleanValueProvider.class)
	private Boolean additionalIDRequired;

	@SearchParameter(name = "jobRequired", provider = BooleanValueProvider.class)
	private Boolean jobRequired;

	@SearchParameter(name = "confirmMarriageReq", provider = BooleanValueProvider.class)
	private Boolean confirmMarriageReq;

	@SearchParameter(name = "minTotalIncome", provider = BigDecimalValueProvider.class)
	private Double minTotalIncome;

	@SearchParameter(name = "minMthsAtJobReg", provider = BigDecimalValueProvider.class)
	private Long minMthsAtJobReg;

	@SearchParameter(name = "minMthsAtJobNoreg", provider = BigDecimalValueProvider.class)
	private Long minMthsAtJobNoreg;

	@SearchParameter(name = "minAgeForMen", provider = BigDecimalValueProvider.class)
	private Long minAgeForMen;

	@SearchParameter(name = "maxAgeForMenApplication", provider = BigDecimalValueProvider.class)
	private Long maxAgeForMenApplication;

	@SearchParameter(name = "maxAgeForMenPaid", provider = BigDecimalValueProvider.class)
	private Long maxAgeForMenPaid;

	@SearchParameter(name = "minAgeForWomen", provider = BigDecimalValueProvider.class)
	private Long minAgeForWomen;

	@SearchParameter(name = "maxAgeForWomenApplication", provider = BigDecimalValueProvider.class)
	private Long maxAgeForWomenApplication;

	@SearchParameter(name = "maxAgeForWomenPaid", provider = BigDecimalValueProvider.class)
	private Long maxAgeForWomenPaid;

	@SearchParameter(name = "bisClientCategory", provider = StringValueProvider.class)
	private String bisClientCategory;

	@SearchParameter(name = "maxPSKPerc", provider = BigDecimalValueProvider.class)
	private Double maxPSKPerc;

	@SearchParameter(name = "minLoanSumRestriction", provider = BigDecimalValueProvider.class)
	private Double minLoanSumRestriction;

	@SearchParameter(name = "maxLoanSumRestriction", provider = BigDecimalValueProvider.class)
	private Double maxLoanSumRestriction;

	@SearchParameter(name = "minDepositSumRestriction", provider = BigDecimalValueProvider.class)
	private Double minDepositSumRestriction;

	@SearchParameter(name = "maxDepositSumRestriction", provider = BigDecimalValueProvider.class)
	private Double maxDepositSumRestriction;

	@SearchParameter(name = "minTermRestriction", provider = BigDecimalValueProvider.class)
	private Long minTermRestriction;

	@SearchParameter(name = "maxTermRestriction", provider = BigDecimalValueProvider.class)
	private Long maxTermRestriction;

	@SearchParameter(name = "refSumLoanRatio", provider = BigDecimalValueProvider.class)
	private Double refSumLoanRatio;

	@SearchParameter(name = "maxAddSum", provider = BigDecimalValueProvider.class)
	private Long maxAddSum;

	@SearchParameter(name = "minAddSum", provider = BigDecimalValueProvider.class)
	private Long minAddSum;

	@SearchParameter(name = "minRefinSum", provider = BigDecimalValueProvider.class)
	private Long minRefinSum;

	@SearchParameter(name = "maxRefinSum", provider = BigDecimalValueProvider.class)
	private Long maxRefinSum;

	@SearchParameter(name = "maxDeviateAmount", provider = BigDecimalValueProvider.class)
	private Double maxDeviateAmount;

	@SearchParameter(name = "creditTermPSK", provider = BigDecimalValueProvider.class)
	private Double creditTermPSK;

	@SearchParameter(name = "errorCode", provider = StringValueProvider.class)
	private String errorCode;

	@SearchParameter(name = "errorText", provider = StringValueProvider.class)
	private String errorText;

	@SearchParameter(name = "bankRate", provider = BigDecimalValueProvider.class)
	private Double bankRate;

	@SearchParameter(name = "specialRateDiscount", provider = BigDecimalValueProvider.class)
	private Double specialRateDiscount;

	@SearchParameter(name = "preDisbursementCheckFlag", provider = BooleanValueProvider.class)
	private Boolean preDisbursementCheckFlag;

	@SearchParameter(name = "electronicCheck", provider = BooleanValueProvider.class)
	private Boolean electronicCheck;

	@SearchParameter(name = "preOfferCheck", provider = BooleanValueProvider.class)
	private Boolean preOfferCheck;

	@SearchParameter(name = "digitalProfileConsent", provider = BooleanValueProvider.class)
	private Boolean digitalProfileConsent;

	@SearchParameter(name = "matrixType", provider = EnumValueProvider.class)
	private MatrixTypeEnum matrixType;

	public MatrixItemDTO(MatrixItem entity) {
		this.id = entity.getId().toString();
		this.siebelId = entity.getSiebelId();
		this.priority = entity.getPriority();
		this.currency = Optional.ofNullable(entity.getCurrency())
				.map(e -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(e)
						.stream()
						.map(CurrencyEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, CurrencyEnum::getValue)))
				.orElse(null);
		this.participantTypes = Optional.ofNullable(entity.getParticipantTypes())
				.map(e -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(e)
						.stream()
						.map(ParticipantTypesEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, ParticipantTypesEnum::getValue)))
				.orElse(null);
		this.attractionCloseChannel = Optional.ofNullable(entity.getAttractionCloseChannel())
				.map(e -> Splitter.on(",").trimResults().omitEmptyStrings()
						.splitToList(e).stream()
						.map(AttractionCloseChannelEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, AttractionCloseChannelEnum::getValue)))
				.orElse(null);
		this.tariffCode = Optional.ofNullable(entity.getTariffCode())
				.map(e -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(e).stream()
						.map(TariffCodeEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, TariffCodeEnum::getValue)))
				.orElse(null);
		this.employerCategory = Optional.ofNullable(entity.getEmployerCategory())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(EmployerCategoryEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, EmployerCategoryEnum::getValue)))
				.orElse(null);
		this.riskSegment = Optional.ofNullable(entity.getRiskSegment())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(RiskSegmentEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, RiskSegmentEnum::getValue)))
				.orElse(null);
		this.categoryGroupGeneral = Optional.ofNullable(entity.getCategoryGroupGeneral())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(CategoryGroupGeneralEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, CategoryGroupGeneralEnum::getValue)))
				.orElse(null);
		this.categoryGroup = Optional.ofNullable(entity.getCategoryGroup())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(CategoryGroupEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, CategoryGroupEnum::getValue)))
				.orElse(null);
		this.salaryClient = Optional.ofNullable(entity.getSalaryClient())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(YesNoEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, YesNoEnum::getValue)))
				.orElse(null);
		this.marketingSegment1 = Optional.ofNullable(entity.getMarketingSegment1())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(MarketingSegment1Enum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, MarketingSegment1Enum::getValue)))
				.orElse(null);
		this.marketingSegment2 = Optional.ofNullable(entity.getMarketingSegment2())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(MarketingSegment2Enum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, MarketingSegment2Enum::getValue)))
				.orElse(null);
		this.marketingSegment3 = Optional.ofNullable(entity.getMarketingSegment3())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(MarketingSegment3Enum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, MarketingSegment3Enum::getValue)))
				.orElse(null);
		this.marketingSegment4 = Optional.ofNullable(entity.getMarketingSegment4())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(MarketingSegment4Enum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, MarketingSegment4Enum::getValue)))
				.orElse(null);
		this.incomeConfirmDocumentType = Optional.ofNullable(entity.getIncomeConfirmDocumentType())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(IncomeConfirmTypeEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, IncomeConfirmTypeEnum::getValue)))
				.orElse(null);
		this.insuranceType = Optional.ofNullable(entity.getInsuranceType())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(InsuranceTypeAdmEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, InsuranceTypeAdmEnum::getValue)))
				.orElse(null);
		this.rBSubsequentPledgeFlag = Optional.ofNullable(entity.getRBSubsequentPledgeFlag())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(YesNoEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, YesNoEnum::getValue)))
				.orElse(null);
		this.hasCollateralFlg = entity.getHasCollateralFlg();
		this.cardType = Optional.ofNullable(entity.getCardType())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(CardTypeEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, CardTypeEnum::getValue)))
				.orElse(null);
		this.cardCategory = Optional.ofNullable(entity.getCardCategory())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(CardCategoryEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, CardCategoryEnum::getValue)))
				.orElse(null);
		this.minTermMonths = entity.getMinTermMonths();
		this.maxTermMonths = entity.getMaxTermMonths();
		this.minSum = entity.getMinSum();
		this.maxSum = entity.getMaxSum();
		this.gBCLoanCategory = Optional.ofNullable(entity.getGBCLoanCategory())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(GBCLoanCategoryEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, GBCLoanCategoryEnum::getValue)))
				.orElse(null);
		this.proofOfIncome = Optional.ofNullable(entity.getProofOfIncome())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(ProofOfIncomeEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, ProofOfIncomeEnum::getValue)))
				.orElse(null);
		this.tariffVersionPF = entity.getTariffVersionPF();
		this.tariffNamePf = entity.getTariffNamePf();
		this.dismissTariffNamePf = entity.getDismissTariffNamePf();
		this.ratePercent = entity.getRatePercent();
		this.cashCreditRate = entity.getCashCreditRate();
		this.specCondRate = entity.getSpecCondRate();
		this.minPercentRate = entity.getMinPercentRate();
		this.minMonthlyPaymentForMainDebt = entity.getMinMonthlyPaymentForMainDebt();
		this.minMounthPayment = entity.getMinMounthPayment();
		this.cashCommissionOverdraft = entity.getCashCommissionOverdraft();
		this.penaltiesForPaymDelayPf = entity.getPenaltiesForPaymDelayPf();
		this.penaltiesForNoCascoPf = entity.getPenaltiesForNoCascoPf();
		this.paymentScheme = entity.getPaymentScheme();
		this.gracePeriodMonth = entity.getGracePeriodMonth();
		this.maxDelayTerm = entity.getMaxDelayTerm();
		this.minDelayTerm = entity.getMinDelayTerm();
		this.delayToLoanTerm = entity.getDelayToLoanTerm();
		this.aTCScheduleType = entity.getATCScheduleType();
		this.movePaymentDateFlg = entity.getMovePaymentDateFlg();
		this.cardIssueCommission = entity.getCardIssueCommission();
		this.instantCardCommission = entity.getInstantCardCommission();
		this.onetimeCardCommission = entity.getOnetimeCardCommission();
		this.minCardServiceCommission = entity.getMinCardServiceCommission();
		this.maxCardServiceCommission = entity.getMaxCardServiceCommission();
		this.fstYrCardCommission = entity.getFstYrCardCommission();
		this.secondYrCardCommission = entity.getSecondYrCardCommission();
		this.thirdYrCard = entity.getThirdYrCard();
		this.fstYrCardCommissionPF = entity.getFstYrCardCommissionPF();
		this.secondYrCardCommissionPF = entity.getSecondYrCardCommissionPF();
		this.thirdYrCardCommissionPF = entity.getThirdYrCardCommissionPF();
		this.cashCommission = entity.getCashCommission();
		this.othbankMoneyComission = entity.getOthbankMoneyComission();
		this.bISCardProductCode = entity.getBISCardProductCode();
		this.binRange = entity.getBinRange();
		this.cardTariffCode = entity.getCardTariffCode();
		this.limitOperationSum = entity.getLimitOperationSum();
		this.aRTProductCode = entity.getARTProductCode();
		this.maxPDN = entity.getMaxPDN();
		this.minPDN = entity.getMinPDN();
		this.bISLoanCategory = entity.getBISLoanCategory();
		this.targetOpenSystem = entity.getTargetOpenSystem();
		this.rfResidentRequired = entity.getRfResidentRequired();
		this.bankDivnJobAddress = entity.getBankDivnJobAddress();
		this.bankDivnResidency = entity.getBankDivnResidency();
		this.additionalIDRequired = entity.getAdditionalIDRequired();
		this.jobRequired = entity.getJobRequired();
		this.confirmMarriageReq = entity.getConfirmMarriageReq();
		this.minTotalIncome = entity.getMinTotalIncome();
		this.minMthsAtJobReg = entity.getMinMthsAtJobReg();
		this.minMthsAtJobNoreg = entity.getMinMthsAtJobNoreg();
		this.minAgeForMen = entity.getMinAgeForMen();
		this.maxAgeForMenApplication = entity.getMaxAgeForMenApplication();
		this.maxAgeForMenPaid = entity.getMaxAgeForMenPaid();
		this.minAgeForWomen = entity.getMinAgeForWomen();
		this.maxAgeForWomenApplication = entity.getMaxAgeForWomenApplication();
		this.maxAgeForWomenPaid = entity.getMaxAgeForWomenPaid();
		this.bisClientCategory = entity.getBisClientCategory();
		this.proofOfIncome = Optional.ofNullable(entity.getProofOfIncome())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(ProofOfIncomeEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, ProofOfIncomeEnum::getValue)))
				.orElse(null);
		this.maxPSKPerc = entity.getMaxPSKPerc();
		this.minLoanSumRestriction = entity.getMinLoanSumRestriction();
		this.maxLoanSumRestriction = entity.getMaxLoanSumRestriction();
		this.minDepositSumRestriction = entity.getMinDepositSumRestriction();
		this.maxDepositSumRestriction = entity.getMaxDepositSumRestriction();
		this.minTermRestriction = entity.getMinTermRestriction();
		this.maxTermRestriction = entity.getMaxTermRestriction();
		this.refSumLoanRatio = entity.getRefSumLoanRatio();
		this.maxAddSum = entity.getMaxAddSum();
		this.minAddSum = entity.getMinAddSum();
		this.minRefinSum = entity.getMinRefinSum();
		this.maxRefinSum = entity.getMaxRefinSum();
		this.maxDeviateAmount = entity.getMaxDeviateAmount();
		this.creditTermPSK = entity.getCreditTermPSK();
		this.errorCode = entity.getErrorCode();
		this.errorText = entity.getErrorText();
		this.bankRate = entity.getBankRate();
		this.specialRateDiscount = entity.getSpecialRateDiscount();
		this.preDisbursementCheckFlag = entity.getPreDisbursementCheckFlag();
		this.electronicCheck = entity.getElectronicCheck();
		this.preOfferCheck = entity.getPreOfferCheck();
		this.digitalProfileConsent = entity.getDigitalProfileConsent();
		this.matrixType = entity.getMatrixType();
	}

}
