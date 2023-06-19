package org.demo.service;

import java.util.Arrays;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.MatrixItemDTO;
import org.demo.dto.MatrixItemDTO_;
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
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MatrixItemMeta extends FieldMetaBuilder<MatrixItemDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MatrixItemDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnumValues(MatrixItemDTO_.matrixType, MatrixTypeEnum.values());
		fields.setEnabled(MatrixItemDTO_.matrixType);
		fields.setEnabled(MatrixItemDTO_.digitalProfileConsent);
		fields.setEnabled(MatrixItemDTO_.preOfferCheck);
		fields.setEnabled(MatrixItemDTO_.electronicCheck);
		fields.setEnabled(MatrixItemDTO_.preDisbursementCheckFlag);
		fields.setEnabled(MatrixItemDTO_.specialRateDiscount);
		fields.setEnabled(MatrixItemDTO_.bankRate);
		fields.setEnabled(MatrixItemDTO_.errorText);
		fields.setEnabled(MatrixItemDTO_.errorCode);
		fields.setEnabled(MatrixItemDTO_.creditTermPSK);
		fields.setEnabled(MatrixItemDTO_.maxDeviateAmount);
		fields.setEnabled(MatrixItemDTO_.maxRefinSum);
		fields.setEnabled(MatrixItemDTO_.minRefinSum);
		fields.setEnabled(MatrixItemDTO_.minAddSum);
		fields.setEnabled(MatrixItemDTO_.maxAddSum);
		fields.setEnabled(MatrixItemDTO_.refSumLoanRatio);
		fields.setEnabled(MatrixItemDTO_.maxTermRestriction);
		fields.setEnabled(MatrixItemDTO_.minTermRestriction);
		fields.setEnabled(MatrixItemDTO_.maxDepositSumRestriction);
		fields.setEnabled(MatrixItemDTO_.minDepositSumRestriction);
		fields.setEnabled(MatrixItemDTO_.maxLoanSumRestriction);
		fields.setEnabled(MatrixItemDTO_.minLoanSumRestriction);
		fields.setEnabled(MatrixItemDTO_.maxPSKPerc);
		fields.setDictionaryTypeWithCustomValues(MatrixItemDTO_.proofOfIncome, Arrays.stream(ProofOfIncomeEnum.values())
				.map(ProofOfIncomeEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(MatrixItemDTO_.proofOfIncome);
		fields.setEnabled(MatrixItemDTO_.bisClientCategory);
		fields.setEnabled(MatrixItemDTO_.maxAgeForWomenPaid);
		fields.setEnabled(MatrixItemDTO_.maxAgeForWomenApplication);
		fields.setEnabled(MatrixItemDTO_.minAgeForWomen);
		fields.setEnabled(MatrixItemDTO_.maxAgeForMenPaid);
		fields.setEnabled(MatrixItemDTO_.maxAgeForMenApplication);
		fields.setEnabled(MatrixItemDTO_.minAgeForMen);
		fields.setEnabled(MatrixItemDTO_.minMthsAtJobNoreg);
		fields.setEnabled(MatrixItemDTO_.minMthsAtJobReg);
		fields.setEnabled(MatrixItemDTO_.minTotalIncome);
		fields.setEnabled(MatrixItemDTO_.confirmMarriageReq);
		fields.setEnabled(MatrixItemDTO_.jobRequired);
		fields.setEnabled(MatrixItemDTO_.additionalIDRequired);
		fields.setEnabled(MatrixItemDTO_.bankDivnResidency);
		fields.setEnabled(MatrixItemDTO_.bankDivnJobAddress);
		fields.setEnabled(MatrixItemDTO_.rfResidentRequired);
		fields.setEnumValues(MatrixItemDTO_.targetOpenSystem, TargetOpenSystemEnum.values());
		fields.setEnabled(MatrixItemDTO_.targetOpenSystem);
		fields.setEnabled(MatrixItemDTO_.bISLoanCategory);
		fields.setEnabled(MatrixItemDTO_.minPDN);
		fields.setEnabled(MatrixItemDTO_.maxPDN);
		fields.setEnabled(MatrixItemDTO_.aRTProductCode);
		fields.setEnabled(MatrixItemDTO_.limitOperationSum);
		fields.setEnabled(MatrixItemDTO_.cardTariffCode);
		fields.setEnabled(MatrixItemDTO_.binRange);
		fields.setEnabled(MatrixItemDTO_.bISCardProductCode);
		fields.setEnabled(MatrixItemDTO_.othbankMoneyComission);
		fields.setEnabled(MatrixItemDTO_.cashCommission);
		fields.setEnabled(MatrixItemDTO_.thirdYrCardCommissionPF);
		fields.setEnabled(MatrixItemDTO_.secondYrCardCommissionPF);
		fields.setEnabled(MatrixItemDTO_.fstYrCardCommissionPF);
		fields.setEnabled(MatrixItemDTO_.thirdYrCard);
		fields.setEnabled(MatrixItemDTO_.secondYrCardCommission);
		fields.setEnabled(MatrixItemDTO_.fstYrCardCommission);
		fields.setEnabled(MatrixItemDTO_.maxCardServiceCommission);
		fields.setEnabled(MatrixItemDTO_.minCardServiceCommission);
		fields.setEnabled(MatrixItemDTO_.onetimeCardCommission);
		fields.setEnabled(MatrixItemDTO_.instantCardCommission);
		fields.setEnabled(MatrixItemDTO_.cardIssueCommission);
		fields.setEnabled(MatrixItemDTO_.movePaymentDateFlg);
		fields.setEnumValues(MatrixItemDTO_.aTCScheduleType, ATCScheduleTypeEnum.values());
		fields.setEnabled(MatrixItemDTO_.aTCScheduleType);
		fields.setEnabled(MatrixItemDTO_.delayToLoanTerm);
		fields.setEnabled(MatrixItemDTO_.minDelayTerm);
		fields.setEnabled(MatrixItemDTO_.maxDelayTerm);
		fields.setEnabled(MatrixItemDTO_.gracePeriodMonth);
		fields.setEnabled(MatrixItemDTO_.paymentScheme);
		fields.setEnabled(MatrixItemDTO_.penaltiesForNoCascoPf);
		fields.setEnabled(MatrixItemDTO_.penaltiesForPaymDelayPf);
		fields.setEnabled(MatrixItemDTO_.cashCommissionOverdraft);
		fields.setEnabled(MatrixItemDTO_.minMounthPayment);
		fields.setEnabled(MatrixItemDTO_.minMonthlyPaymentForMainDebt);
		fields.setEnabled(MatrixItemDTO_.minPercentRate);
		fields.setEnabled(MatrixItemDTO_.specCondRate);
		fields.setEnabled(MatrixItemDTO_.cashCreditRate);
		fields.setEnabled(MatrixItemDTO_.ratePercent);
		fields.setEnabled(MatrixItemDTO_.dismissTariffNamePf);
		fields.setEnabled(MatrixItemDTO_.tariffNamePf);
		fields.setEnabled(MatrixItemDTO_.tariffVersionPF);
		fields.setDictionaryTypeWithCustomValues(MatrixItemDTO_.proofOfIncome, Arrays.stream(ProofOfIncomeEnum.values())
				.map(ProofOfIncomeEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(MatrixItemDTO_.proofOfIncome);
		fields.setDictionaryTypeWithCustomValues(MatrixItemDTO_.gBCLoanCategory, Arrays.stream(GBCLoanCategoryEnum.values())
				.map(GBCLoanCategoryEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(MatrixItemDTO_.gBCLoanCategory);
		fields.setEnabled(MatrixItemDTO_.maxSum);
		fields.setEnabled(MatrixItemDTO_.minSum);
		fields.setEnabled(MatrixItemDTO_.maxTermMonths);
		fields.setEnabled(MatrixItemDTO_.minTermMonths);
		fields.setDictionaryTypeWithCustomValues(MatrixItemDTO_.cardCategory, Arrays.stream(CardCategoryEnum.values())
				.map(CardCategoryEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(MatrixItemDTO_.cardCategory);
		fields.setDictionaryTypeWithCustomValues(MatrixItemDTO_.cardType, Arrays.stream(CardTypeEnum.values())
				.map(CardTypeEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(MatrixItemDTO_.cardType);
		fields.setEnabled(MatrixItemDTO_.hasCollateralFlg);
		fields.setDictionaryTypeWithCustomValues(
				MatrixItemDTO_.rBSubsequentPledgeFlag,
				Arrays.stream(YesNoEnum.values())
						.map(YesNoEnum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(MatrixItemDTO_.rBSubsequentPledgeFlag);
		fields.setDictionaryTypeWithCustomValues(MatrixItemDTO_.insuranceType, Arrays.stream(InsuranceTypeAdmEnum.values())
				.map(InsuranceTypeAdmEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(MatrixItemDTO_.insuranceType);
		fields.setDictionaryTypeWithCustomValues(
				MatrixItemDTO_.incomeConfirmDocumentType,
				Arrays.stream(IncomeConfirmTypeEnum.values())
						.map(IncomeConfirmTypeEnum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(MatrixItemDTO_.incomeConfirmDocumentType);
		fields.setDictionaryTypeWithCustomValues(
				MatrixItemDTO_.marketingSegment4,
				Arrays.stream(MarketingSegment4Enum.values())
						.map(MarketingSegment4Enum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(MatrixItemDTO_.marketingSegment4);
		fields.setDictionaryTypeWithCustomValues(
				MatrixItemDTO_.marketingSegment3,
				Arrays.stream(MarketingSegment3Enum.values())
						.map(MarketingSegment3Enum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(MatrixItemDTO_.marketingSegment3);
		fields.setDictionaryTypeWithCustomValues(
				MatrixItemDTO_.marketingSegment2,
				Arrays.stream(MarketingSegment2Enum.values())
						.map(MarketingSegment2Enum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(MatrixItemDTO_.marketingSegment2);
		fields.setDictionaryTypeWithCustomValues(
				MatrixItemDTO_.marketingSegment1,
				Arrays.stream(MarketingSegment1Enum.values())
						.map(MarketingSegment1Enum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(MatrixItemDTO_.marketingSegment1);
		fields.setDictionaryTypeWithCustomValues(MatrixItemDTO_.salaryClient, Arrays.stream(YesNoEnum.values())
				.map(YesNoEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(MatrixItemDTO_.salaryClient);
		fields.setDictionaryTypeWithCustomValues(MatrixItemDTO_.categoryGroup, Arrays.stream(CategoryGroupEnum.values())
				.map(CategoryGroupEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(MatrixItemDTO_.categoryGroup);
		fields.setDictionaryTypeWithCustomValues(
				MatrixItemDTO_.categoryGroupGeneral,
				Arrays.stream(CategoryGroupGeneralEnum.values())
						.map(CategoryGroupGeneralEnum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(MatrixItemDTO_.categoryGroupGeneral);
		fields.setDictionaryTypeWithCustomValues(MatrixItemDTO_.riskSegment, Arrays.stream(RiskSegmentEnum.values())
				.map(RiskSegmentEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(MatrixItemDTO_.riskSegment);
		fields.setDictionaryTypeWithCustomValues(
				MatrixItemDTO_.employerCategory,
				Arrays.stream(EmployerCategoryEnum.values())
						.map(EmployerCategoryEnum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(MatrixItemDTO_.employerCategory);
		fields.setDictionaryTypeWithCustomValues(MatrixItemDTO_.tariffCode, Arrays.stream(TariffCodeEnum.values())
				.map(TariffCodeEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(MatrixItemDTO_.tariffCode);
		fields.setDictionaryTypeWithCustomValues(
				MatrixItemDTO_.attractionCloseChannel,
				Arrays.stream(AttractionCloseChannelEnum.values())
						.map(AttractionCloseChannelEnum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(MatrixItemDTO_.attractionCloseChannel);
		fields.setDictionaryTypeWithCustomValues(
				MatrixItemDTO_.participantTypes,
				Arrays.stream(ParticipantTypesEnum.values())
						.map(ParticipantTypesEnum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(MatrixItemDTO_.participantTypes);
		fields.setDictionaryTypeWithCustomValues(MatrixItemDTO_.currency, Arrays.stream(CurrencyEnum.values())
				.map(CurrencyEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(MatrixItemDTO_.currency);
		fields.setEnabled(MatrixItemDTO_.priority);
		fields.setEnabled(MatrixItemDTO_.siebelId);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MatrixItemDTO> fields, InnerBcDescription bcDescription, Long parentId) {
		fields.setEnumFilterValues(fields, MatrixItemDTO_.matrixType, MatrixTypeEnum.values());
		fields.enableFilter(MatrixItemDTO_.matrixType);
		fields.enableFilter(MatrixItemDTO_.digitalProfileConsent);
		fields.enableFilter(MatrixItemDTO_.preOfferCheck);
		fields.enableFilter(MatrixItemDTO_.electronicCheck);
		fields.enableFilter(MatrixItemDTO_.preDisbursementCheckFlag);
		fields.enableFilter(MatrixItemDTO_.specialRateDiscount);
		fields.enableFilter(MatrixItemDTO_.bankRate);
		fields.enableFilter(MatrixItemDTO_.errorText);
		fields.enableFilter(MatrixItemDTO_.errorCode);
		fields.enableFilter(MatrixItemDTO_.creditTermPSK);
		fields.enableFilter(MatrixItemDTO_.maxDeviateAmount);
		fields.enableFilter(MatrixItemDTO_.maxRefinSum);
		fields.enableFilter(MatrixItemDTO_.minRefinSum);
		fields.enableFilter(MatrixItemDTO_.minAddSum);
		fields.enableFilter(MatrixItemDTO_.maxAddSum);
		fields.enableFilter(MatrixItemDTO_.refSumLoanRatio);
		fields.enableFilter(MatrixItemDTO_.maxTermRestriction);
		fields.enableFilter(MatrixItemDTO_.minTermRestriction);
		fields.enableFilter(MatrixItemDTO_.maxDepositSumRestriction);
		fields.enableFilter(MatrixItemDTO_.minDepositSumRestriction);
		fields.enableFilter(MatrixItemDTO_.maxLoanSumRestriction);
		fields.enableFilter(MatrixItemDTO_.minLoanSumRestriction);
		fields.enableFilter(MatrixItemDTO_.maxPSKPerc);
		fields.enableFilter(MatrixItemDTO_.proofOfIncome);
		fields.enableFilter(MatrixItemDTO_.bisClientCategory);
		fields.enableFilter(MatrixItemDTO_.maxAgeForWomenPaid);
		fields.enableFilter(MatrixItemDTO_.maxAgeForWomenApplication);
		fields.enableFilter(MatrixItemDTO_.minAgeForWomen);
		fields.enableFilter(MatrixItemDTO_.maxAgeForMenPaid);
		fields.enableFilter(MatrixItemDTO_.maxAgeForMenApplication);
		fields.enableFilter(MatrixItemDTO_.minAgeForMen);
		fields.enableFilter(MatrixItemDTO_.minMthsAtJobNoreg);
		fields.enableFilter(MatrixItemDTO_.minMthsAtJobReg);
		fields.enableFilter(MatrixItemDTO_.minTotalIncome);
		fields.enableFilter(MatrixItemDTO_.confirmMarriageReq);
		fields.enableFilter(MatrixItemDTO_.jobRequired);
		fields.enableFilter(MatrixItemDTO_.additionalIDRequired);
		fields.enableFilter(MatrixItemDTO_.bankDivnResidency);
		fields.enableFilter(MatrixItemDTO_.bankDivnJobAddress);
		fields.enableFilter(MatrixItemDTO_.rfResidentRequired);
		fields.setEnumFilterValues(fields, MatrixItemDTO_.targetOpenSystem, TargetOpenSystemEnum.values());
		fields.enableFilter(MatrixItemDTO_.targetOpenSystem);
		fields.enableFilter(MatrixItemDTO_.bISLoanCategory);
		fields.enableFilter(MatrixItemDTO_.minPDN);
		fields.enableFilter(MatrixItemDTO_.maxPDN);
		fields.enableFilter(MatrixItemDTO_.aRTProductCode);
		fields.enableFilter(MatrixItemDTO_.limitOperationSum);
		fields.enableFilter(MatrixItemDTO_.cardTariffCode);
		fields.enableFilter(MatrixItemDTO_.binRange);
		fields.enableFilter(MatrixItemDTO_.bISCardProductCode);
		fields.enableFilter(MatrixItemDTO_.othbankMoneyComission);
		fields.enableFilter(MatrixItemDTO_.cashCommission);
		fields.enableFilter(MatrixItemDTO_.thirdYrCardCommissionPF);
		fields.enableFilter(MatrixItemDTO_.secondYrCardCommissionPF);
		fields.enableFilter(MatrixItemDTO_.fstYrCardCommissionPF);
		fields.enableFilter(MatrixItemDTO_.thirdYrCard);
		fields.enableFilter(MatrixItemDTO_.secondYrCardCommission);
		fields.enableFilter(MatrixItemDTO_.fstYrCardCommission);
		fields.enableFilter(MatrixItemDTO_.maxCardServiceCommission);
		fields.enableFilter(MatrixItemDTO_.minCardServiceCommission);
		fields.enableFilter(MatrixItemDTO_.onetimeCardCommission);
		fields.enableFilter(MatrixItemDTO_.instantCardCommission);
		fields.enableFilter(MatrixItemDTO_.cardIssueCommission);
		fields.enableFilter(MatrixItemDTO_.movePaymentDateFlg);
		fields.setEnumFilterValues(fields, MatrixItemDTO_.aTCScheduleType, ATCScheduleTypeEnum.values());
		fields.enableFilter(MatrixItemDTO_.aTCScheduleType);
		fields.enableFilter(MatrixItemDTO_.delayToLoanTerm);
		fields.enableFilter(MatrixItemDTO_.minDelayTerm);
		fields.enableFilter(MatrixItemDTO_.maxDelayTerm);
		fields.enableFilter(MatrixItemDTO_.gracePeriodMonth);
		fields.enableFilter(MatrixItemDTO_.paymentScheme);
		fields.enableFilter(MatrixItemDTO_.penaltiesForNoCascoPf);
		fields.enableFilter(MatrixItemDTO_.penaltiesForPaymDelayPf);
		fields.enableFilter(MatrixItemDTO_.cashCommissionOverdraft);
		fields.enableFilter(MatrixItemDTO_.minMounthPayment);
		fields.enableFilter(MatrixItemDTO_.minMonthlyPaymentForMainDebt);
		fields.enableFilter(MatrixItemDTO_.minPercentRate);
		fields.enableFilter(MatrixItemDTO_.specCondRate);
		fields.enableFilter(MatrixItemDTO_.cashCreditRate);
		fields.enableFilter(MatrixItemDTO_.ratePercent);
		fields.enableFilter(MatrixItemDTO_.dismissTariffNamePf);
		fields.enableFilter(MatrixItemDTO_.tariffNamePf);
		fields.enableFilter(MatrixItemDTO_.tariffVersionPF);
		fields.enableFilter(MatrixItemDTO_.proofOfIncome);
		fields.enableFilter(MatrixItemDTO_.gBCLoanCategory);
		fields.enableFilter(MatrixItemDTO_.maxSum);
		fields.enableFilter(MatrixItemDTO_.minSum);
		fields.enableFilter(MatrixItemDTO_.maxTermMonths);
		fields.enableFilter(MatrixItemDTO_.minTermMonths);
		fields.enableFilter(MatrixItemDTO_.cardCategory);
		fields.enableFilter(MatrixItemDTO_.cardType);
		fields.enableFilter(MatrixItemDTO_.hasCollateralFlg);
		fields.enableFilter(MatrixItemDTO_.rBSubsequentPledgeFlag);
		fields.enableFilter(MatrixItemDTO_.insuranceType);
		fields.enableFilter(MatrixItemDTO_.incomeConfirmDocumentType);
		fields.enableFilter(MatrixItemDTO_.marketingSegment4);
		fields.enableFilter(MatrixItemDTO_.marketingSegment3);
		fields.enableFilter(MatrixItemDTO_.marketingSegment2);
		fields.enableFilter(MatrixItemDTO_.marketingSegment1);
		fields.enableFilter(MatrixItemDTO_.salaryClient);
		fields.enableFilter(MatrixItemDTO_.categoryGroup);
		fields.enableFilter(MatrixItemDTO_.categoryGroupGeneral);
		fields.enableFilter(MatrixItemDTO_.riskSegment);
		fields.enableFilter(MatrixItemDTO_.employerCategory);
		fields.enableFilter(MatrixItemDTO_.tariffCode);
		fields.enableFilter(MatrixItemDTO_.attractionCloseChannel);
		fields.enableFilter(MatrixItemDTO_.participantTypes);
		fields.enableFilter(MatrixItemDTO_.currency);
		fields.enableFilter(MatrixItemDTO_.priority);
		fields.enableFilter(MatrixItemDTO_.siebelId);


	}

}
