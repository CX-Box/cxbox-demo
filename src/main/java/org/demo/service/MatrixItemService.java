package org.demo.service;

import static org.cxbox.api.data.dao.SpecificationUtils.and;
import static org.demo.repository.MatrixItemRepository.byMatrixType;
import static org.demo.repository.MatrixItemRepository.byProductId;

import java.util.stream.Collectors;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.action.Actions;
import org.demo.controller.CxboxRestController;
import org.demo.dto.MatrixItemDTO;
import org.demo.dto.MatrixItemDTO_;
import org.demo.entity.MatrixItem;
import org.demo.entity.MatrixItem_;
import org.demo.entity.Product_;
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
import org.demo.entity.enums.YesNoEnum;
import org.demo.entity.enums.RiskSegmentEnum;
import org.demo.entity.enums.TariffCodeEnum;
import org.demo.repository.MatrixItemRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MatrixItemService extends VersionAwareResponseService<MatrixItemDTO, MatrixItem> {

	public MatrixItemService() {
		super(MatrixItemDTO.class, MatrixItem.class, null, MatrixItemMeta.class);
	}

	@Override
	protected Specification<MatrixItem> getSpecification(BusinessComponent bc) {
		Specification<MatrixItem> spec = super.getSpecification(bc);
		if (CxboxRestController.matrixItem.isBc(bc)) {
			spec = spec.and(byProductId(bc.getParentIdAsLong()));
		}
		if (CxboxRestController.matrixItemProduct.isBc(bc)) {
			spec = spec.and(byProductId(bc.getParentIdAsLong())).and(byMatrixType(MatrixTypeEnum.Product));
		}
		if (CxboxRestController.matrixItemError.isBc(bc)) {
			spec = spec.and(byProductId(bc.getParentIdAsLong())).and(byMatrixType(MatrixTypeEnum.ErrorMatrix));
		}
		if (CxboxRestController.matrixItemBIS.isBc(bc)) {
			spec = spec.and(byProductId(bc.getParentIdAsLong())).and(byMatrixType(MatrixTypeEnum.BISParams));
		}
		if (CxboxRestController.matrixItemCardCommission.isBc(bc)) {
			spec = spec.and(byProductId(bc.getParentIdAsLong())).and(byMatrixType(MatrixTypeEnum.CardCommissions));
		}
		if (CxboxRestController.matrixItemMaxPsk.isBc(bc)) {
			spec = spec.and(byProductId(bc.getParentIdAsLong())).and(byMatrixType(MatrixTypeEnum.MaxPSK));
		}
		if (CxboxRestController.matrixItemRequirements.isBc(bc)) {
			spec = spec.and(byProductId(bc.getParentIdAsLong())).and(byMatrixType(MatrixTypeEnum.Requirements));
		}
		if (CxboxRestController.matrixItemProdDisc.isBc(bc)) {
			spec = spec.and(byProductId(bc.getParentIdAsLong())).and(byMatrixType(MatrixTypeEnum.ProductDiscount));
		}
		if (CxboxRestController.matrixItemPDC.isBc(bc)) {
			spec = spec.and(byProductId(bc.getParentIdAsLong())).and(byMatrixType(MatrixTypeEnum.PDC));
		}
		if (CxboxRestController.matrixItemSumBound.isBc(bc)) {
			spec = spec.and(byProductId(bc.getParentIdAsLong())).and(byMatrixType(MatrixTypeEnum.SumBoundaries));
		}
		if (CxboxRestController.matrixItemTariff.isBc(bc)) {
			spec = spec.and(byProductId(bc.getParentIdAsLong())).and(byMatrixType(MatrixTypeEnum.Tariff));
		}
		return spec;
	}


	@Override
	protected CreateResult<MatrixItemDTO> doCreateEntity(MatrixItem entity, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	protected ActionResultDTO<MatrixItemDTO> doUpdateEntity(MatrixItem entity, MatrixItemDTO data, BusinessComponent bc) {
		if (data.isFieldChanged(MatrixItemDTO_.matrixType)) {
			entity.setMatrixType(data.getMatrixType());
		}
		if (data.isFieldChanged(MatrixItemDTO_.digitalProfileConsent)) {
			entity.setDigitalProfileConsent(data.getDigitalProfileConsent());
		}
		if (data.isFieldChanged(MatrixItemDTO_.preOfferCheck)) {
			entity.setPreOfferCheck(data.getPreOfferCheck());
		}
		if (data.isFieldChanged(MatrixItemDTO_.electronicCheck)) {
			entity.setElectronicCheck(data.getElectronicCheck());
		}
		if (data.isFieldChanged(MatrixItemDTO_.preDisbursementCheckFlag)) {
			entity.setPreDisbursementCheckFlag(data.getPreDisbursementCheckFlag());
		}
		if (data.isFieldChanged(MatrixItemDTO_.specialRateDiscount)) {
			entity.setSpecialRateDiscount(data.getSpecialRateDiscount());
		}
		if (data.isFieldChanged(MatrixItemDTO_.bankRate)) {
			entity.setBankRate(data.getBankRate());
		}
		if (data.isFieldChanged(MatrixItemDTO_.errorText)) {
			entity.setErrorText(data.getErrorText());
		}
		if (data.isFieldChanged(MatrixItemDTO_.errorCode)) {
			entity.setErrorCode(data.getErrorCode());
		}
		if (data.isFieldChanged(MatrixItemDTO_.creditTermPSK)) {
			entity.setCreditTermPSK(data.getCreditTermPSK());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxDeviateAmount)) {
			entity.setMaxDeviateAmount(data.getMaxDeviateAmount());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxRefinSum)) {
			entity.setMaxRefinSum(data.getMaxRefinSum());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minRefinSum)) {
			entity.setMinRefinSum(data.getMinRefinSum());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minAddSum)) {
			entity.setMinAddSum(data.getMinAddSum());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxAddSum)) {
			entity.setMaxAddSum(data.getMaxAddSum());
		}
		if (data.isFieldChanged(MatrixItemDTO_.refSumLoanRatio)) {
			entity.setRefSumLoanRatio(data.getRefSumLoanRatio());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxTermRestriction)) {
			entity.setMaxTermRestriction(data.getMaxTermRestriction());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minTermRestriction)) {
			entity.setMinTermRestriction(data.getMinTermRestriction());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxDepositSumRestriction)) {
			entity.setMaxDepositSumRestriction(data.getMaxDepositSumRestriction());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minDepositSumRestriction)) {
			entity.setMinDepositSumRestriction(data.getMinDepositSumRestriction());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxLoanSumRestriction)) {
			entity.setMaxLoanSumRestriction(data.getMaxLoanSumRestriction());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minLoanSumRestriction)) {
			entity.setMinLoanSumRestriction(data.getMinLoanSumRestriction());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxPSKPerc)) {
			entity.setMaxPSKPerc(data.getMaxPSKPerc());
		}
		if (data.isFieldChanged(MatrixItemDTO_.proofOfIncome)) {
			entity.setProofOfIncome(data.getProofOfIncome().getValues().stream()
					.map(v -> ProofOfIncomeEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.bisClientCategory)) {
			entity.setBisClientCategory(data.getBisClientCategory());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxAgeForWomenPaid)) {
			entity.setMaxAgeForWomenPaid(data.getMaxAgeForWomenPaid());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxAgeForWomenApplication)) {
			entity.setMaxAgeForWomenApplication(data.getMaxAgeForWomenApplication());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minAgeForWomen)) {
			entity.setMinAgeForWomen(data.getMinAgeForWomen());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxAgeForMenPaid)) {
			entity.setMaxAgeForMenPaid(data.getMaxAgeForMenPaid());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxAgeForMenApplication)) {
			entity.setMaxAgeForMenApplication(data.getMaxAgeForMenApplication());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minAgeForMen)) {
			entity.setMinAgeForMen(data.getMinAgeForMen());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minMthsAtJobNoreg)) {
			entity.setMinMthsAtJobNoreg(data.getMinMthsAtJobNoreg());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minMthsAtJobReg)) {
			entity.setMinMthsAtJobReg(data.getMinMthsAtJobReg());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minTotalIncome)) {
			entity.setMinTotalIncome(data.getMinTotalIncome());
		}
		if (data.isFieldChanged(MatrixItemDTO_.confirmMarriageReq)) {
			entity.setConfirmMarriageReq(data.getConfirmMarriageReq());
		}
		if (data.isFieldChanged(MatrixItemDTO_.jobRequired)) {
			entity.setJobRequired(data.getJobRequired());
		}
		if (data.isFieldChanged(MatrixItemDTO_.additionalIDRequired)) {
			entity.setAdditionalIDRequired(data.getAdditionalIDRequired());
		}
		if (data.isFieldChanged(MatrixItemDTO_.bankDivnResidency)) {
			entity.setBankDivnResidency(data.getBankDivnResidency());
		}
		if (data.isFieldChanged(MatrixItemDTO_.bankDivnJobAddress)) {
			entity.setBankDivnJobAddress(data.getBankDivnJobAddress());
		}
		if (data.isFieldChanged(MatrixItemDTO_.rfResidentRequired)) {
			entity.setRfResidentRequired(data.getRfResidentRequired());
		}
		if (data.isFieldChanged(MatrixItemDTO_.targetOpenSystem)) {
			entity.setTargetOpenSystem(data.getTargetOpenSystem());
		}
		if (data.isFieldChanged(MatrixItemDTO_.bISLoanCategory)) {
			entity.setBISLoanCategory(data.getBISLoanCategory());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minPDN)) {
			entity.setMinPDN(data.getMinPDN());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxPDN)) {
			entity.setMaxPDN(data.getMaxPDN());
		}
		if (data.isFieldChanged(MatrixItemDTO_.aRTProductCode)) {
			entity.setARTProductCode(data.getARTProductCode());
		}
		if (data.isFieldChanged(MatrixItemDTO_.limitOperationSum)) {
			entity.setLimitOperationSum(data.getLimitOperationSum());
		}
		if (data.isFieldChanged(MatrixItemDTO_.cardTariffCode)) {
			entity.setCardTariffCode(data.getCardTariffCode());
		}
		if (data.isFieldChanged(MatrixItemDTO_.binRange)) {
			entity.setBinRange(data.getBinRange());
		}
		if (data.isFieldChanged(MatrixItemDTO_.bISCardProductCode)) {
			entity.setBISCardProductCode(data.getBISCardProductCode());
		}
		if (data.isFieldChanged(MatrixItemDTO_.othbankMoneyComission)) {
			entity.setOthbankMoneyComission(data.getOthbankMoneyComission());
		}
		if (data.isFieldChanged(MatrixItemDTO_.cashCommission)) {
			entity.setCashCommission(data.getCashCommission());
		}
		if (data.isFieldChanged(MatrixItemDTO_.thirdYrCardCommissionPF)) {
			entity.setThirdYrCardCommissionPF(data.getThirdYrCardCommissionPF());
		}
		if (data.isFieldChanged(MatrixItemDTO_.secondYrCardCommissionPF)) {
			entity.setSecondYrCardCommissionPF(data.getSecondYrCardCommissionPF());
		}
		if (data.isFieldChanged(MatrixItemDTO_.fstYrCardCommissionPF)) {
			entity.setFstYrCardCommissionPF(data.getFstYrCardCommissionPF());
		}
		if (data.isFieldChanged(MatrixItemDTO_.thirdYrCard)) {
			entity.setThirdYrCard(data.getThirdYrCard());
		}
		if (data.isFieldChanged(MatrixItemDTO_.secondYrCardCommission)) {
			entity.setSecondYrCardCommission(data.getSecondYrCardCommission());
		}
		if (data.isFieldChanged(MatrixItemDTO_.fstYrCardCommission)) {
			entity.setFstYrCardCommission(data.getFstYrCardCommission());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxCardServiceCommission)) {
			entity.setMaxCardServiceCommission(data.getMaxCardServiceCommission());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minCardServiceCommission)) {
			entity.setMinCardServiceCommission(data.getMinCardServiceCommission());
		}
		if (data.isFieldChanged(MatrixItemDTO_.onetimeCardCommission)) {
			entity.setOnetimeCardCommission(data.getOnetimeCardCommission());
		}
		if (data.isFieldChanged(MatrixItemDTO_.instantCardCommission)) {
			entity.setInstantCardCommission(data.getInstantCardCommission());
		}
		if (data.isFieldChanged(MatrixItemDTO_.cardIssueCommission)) {
			entity.setCardIssueCommission(data.getCardIssueCommission());
		}
		if (data.isFieldChanged(MatrixItemDTO_.movePaymentDateFlg)) {
			entity.setMovePaymentDateFlg(data.getMovePaymentDateFlg());
		}
		if (data.isFieldChanged(MatrixItemDTO_.aTCScheduleType)) {
			entity.setATCScheduleType(data.getATCScheduleType());
		}
		if (data.isFieldChanged(MatrixItemDTO_.delayToLoanTerm)) {
			entity.setDelayToLoanTerm(data.getDelayToLoanTerm());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minDelayTerm)) {
			entity.setMinDelayTerm(data.getMinDelayTerm());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxDelayTerm)) {
			entity.setMaxDelayTerm(data.getMaxDelayTerm());
		}
		if (data.isFieldChanged(MatrixItemDTO_.gracePeriodMonth)) {
			entity.setGracePeriodMonth(data.getGracePeriodMonth());
		}
		if (data.isFieldChanged(MatrixItemDTO_.paymentScheme)) {
			entity.setPaymentScheme(data.getPaymentScheme());
		}
		if (data.isFieldChanged(MatrixItemDTO_.penaltiesForNoCascoPf)) {
			entity.setPenaltiesForNoCascoPf(data.getPenaltiesForNoCascoPf());
		}
		if (data.isFieldChanged(MatrixItemDTO_.penaltiesForPaymDelayPf)) {
			entity.setPenaltiesForPaymDelayPf(data.getPenaltiesForPaymDelayPf());
		}
		if (data.isFieldChanged(MatrixItemDTO_.cashCommissionOverdraft)) {
			entity.setCashCommissionOverdraft(data.getCashCommissionOverdraft());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minMounthPayment)) {
			entity.setMinMounthPayment(data.getMinMounthPayment());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minMonthlyPaymentForMainDebt)) {
			entity.setMinMonthlyPaymentForMainDebt(data.getMinMonthlyPaymentForMainDebt());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minPercentRate)) {
			entity.setMinPercentRate(data.getMinPercentRate());
		}
		if (data.isFieldChanged(MatrixItemDTO_.specCondRate)) {
			entity.setSpecCondRate(data.getSpecCondRate());
		}
		if (data.isFieldChanged(MatrixItemDTO_.cashCreditRate)) {
			entity.setCashCreditRate(data.getCashCreditRate());
		}
		if (data.isFieldChanged(MatrixItemDTO_.ratePercent)) {
			entity.setRatePercent(data.getRatePercent());
		}
		if (data.isFieldChanged(MatrixItemDTO_.dismissTariffNamePf)) {
			entity.setDismissTariffNamePf(data.getDismissTariffNamePf());
		}
		if (data.isFieldChanged(MatrixItemDTO_.tariffNamePf)) {
			entity.setTariffNamePf(data.getTariffNamePf());
		}
		if (data.isFieldChanged(MatrixItemDTO_.tariffVersionPF)) {
			entity.setTariffVersionPF(data.getTariffVersionPF());
		}
		if (data.isFieldChanged(MatrixItemDTO_.proofOfIncome)) {
			entity.setProofOfIncome(data.getProofOfIncome().getValues().stream()
					.map(v -> ProofOfIncomeEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.gBCLoanCategory)) {
			entity.setGBCLoanCategory(data.getGBCLoanCategory().getValues().stream()
					.map(v -> GBCLoanCategoryEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxSum)) {
			entity.setMaxSum(data.getMaxSum());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minSum)) {
			entity.setMinSum(data.getMinSum());
		}
		if (data.isFieldChanged(MatrixItemDTO_.maxTermMonths)) {
			entity.setMaxTermMonths(data.getMaxTermMonths());
		}
		if (data.isFieldChanged(MatrixItemDTO_.minTermMonths)) {
			entity.setMinTermMonths(data.getMinTermMonths());
		}
		if (data.isFieldChanged(MatrixItemDTO_.cardCategory)) {
			entity.setCardCategory(data.getCardCategory().getValues().stream()
					.map(v -> CardCategoryEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.cardType)) {
			entity.setCardType(data.getCardType().getValues().stream().map(v -> CardTypeEnum.getByValue(v.getValue()))
					.map(Enum::name).collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.hasCollateralFlg)) {
			entity.setHasCollateralFlg(data.getHasCollateralFlg());
		}
		if (data.isFieldChanged(MatrixItemDTO_.rBSubsequentPledgeFlag)) {
			entity.setRBSubsequentPledgeFlag(data.getRBSubsequentPledgeFlag().getValues().stream()
					.map(v -> YesNoEnum.getByValue(v.getValue())).map(Enum::name).collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.insuranceType)) {
			entity.setInsuranceType(data.getInsuranceType().getValues().stream()
					.map(v -> InsuranceTypeAdmEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.incomeConfirmDocumentType)) {
			entity.setIncomeConfirmDocumentType(data.getIncomeConfirmDocumentType().getValues().stream()
					.map(v -> IncomeConfirmTypeEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.marketingSegment4)) {
			entity.setMarketingSegment4(data.getMarketingSegment4().getValues().stream()
					.map(v -> MarketingSegment4Enum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.marketingSegment3)) {
			entity.setMarketingSegment3(data.getMarketingSegment3().getValues().stream()
					.map(v -> MarketingSegment3Enum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.marketingSegment2)) {
			entity.setMarketingSegment2(data.getMarketingSegment2().getValues().stream()
					.map(v -> MarketingSegment2Enum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.marketingSegment1)) {
			entity.setMarketingSegment1(data.getMarketingSegment1().getValues().stream()
					.map(v -> MarketingSegment1Enum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.salaryClient)) {
			entity.setSalaryClient(data.getSalaryClient().getValues().stream().map(v -> YesNoEnum.getByValue(v.getValue()))
					.map(Enum::name).collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.categoryGroup)) {
			entity.setCategoryGroup(data.getCategoryGroup().getValues().stream()
					.map(v -> CategoryGroupEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.categoryGroupGeneral)) {
			entity.setCategoryGroupGeneral(data.getCategoryGroupGeneral().getValues().stream()
					.map(v -> CategoryGroupGeneralEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.riskSegment)) {
			entity.setRiskSegment(data.getRiskSegment().getValues().stream()
					.map(v -> RiskSegmentEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.employerCategory)) {
			entity.setEmployerCategory(data.getEmployerCategory().getValues().stream()
					.map(v -> EmployerCategoryEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.tariffCode)) {
			entity.setTariffCode(data.getTariffCode().getValues().stream().map(v -> TariffCodeEnum.getByValue(v.getValue()))
					.map(Enum::name).collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.attractionCloseChannel)) {
			entity.setAttractionCloseChannel(data.getAttractionCloseChannel().getValues().stream()
					.map(v -> AttractionCloseChannelEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.participantTypes)) {
			entity.setParticipantTypes(data.getParticipantTypes().getValues().stream()
					.map(v -> ParticipantTypesEnum.getByValue(v.getValue())).map(Enum::name)
					.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.currency)) {
			entity.setCurrency(data.getCurrency().getValues().stream().map(v -> CurrencyEnum.getByValue(v.getValue()))
					.map(Enum::name).collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(MatrixItemDTO_.priority)) {
			entity.setPriority(data.getPriority());
		}
		if (data.isFieldChanged(MatrixItemDTO_.siebelId)) {
			entity.setSiebelId(data.getSiebelId());
		}

		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<MatrixItemDTO> getActions() {
		return Actions.<MatrixItemDTO>builder().save().text("Сохранить").add().build();
	}

}
