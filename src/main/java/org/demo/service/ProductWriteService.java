package org.demo.service;

import java.util.stream.Collectors;
import org.cxbox.core.service.action.Actions;
import org.demo.dto.ClientWriteDTO;
import org.demo.dto.ProductDTO;
import org.demo.dto.ProductDTO_;
import org.demo.entity.Product;
import org.demo.entity.enums.CurrencyEnum;
import org.demo.entity.enums.IncomeConfirmTypeEnum;
import org.demo.entity.enums.InsuranceTypeAdmEnum;
import org.demo.entity.enums.PledgeTypeEnum;
import org.demo.repository.ProductRepository;
import org.demo.repository.UserRepository;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ProductWriteService extends VersionAwareResponseService<ProductDTO, Product> {

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private UserRepository userRepository;

	public ProductWriteService() {
		super(ProductDTO.class, Product.class, null, ProductWriteMeta.class);
	}

	@Override
	protected CreateResult<ProductDTO> doCreateEntity(Product entity, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	protected ActionResultDTO<ProductDTO> doUpdateEntity(Product entity, ProductDTO data, BusinessComponent bc) {
		if (data.isFieldChanged(ProductDTO_.gBCCheckedFlg)) {
			entity.setGBCCheckedFlg(data.getGBCCheckedFlg());
		}
		if (data.isFieldChanged(ProductDTO_.notDSA)) {
			entity.setNotDSA(data.getNotDSA());
		}
		if (data.isFieldChanged(ProductDTO_.nonStandartFlag)) {
			entity.setNonStandartFlag(data.getNonStandartFlag());
		}
		if (data.isFieldChanged(ProductDTO_.version)) {
			entity.setVersion(data.getVersion());
		}
		if (data.isFieldChanged(ProductDTO_.endDate)) {
			entity.setEndDate(data.getEndDate());
		}
		if (data.isFieldChanged(ProductDTO_.startDate)) {
			entity.setStartDate(data.getStartDate());
		}
		if (data.isFieldChanged(ProductDTO_.status)) {
			entity.setStatus(data.getStatus());
		}
		if (data.isFieldChanged(ProductDTO_.macroProduct)) {
			entity.setMacroProduct(data.getMacroProduct());
		}
		if (data.isFieldChanged(ProductDTO_.productCode)) {
			entity.setProductCode(data.getProductCode());
		}
		if (data.isFieldChanged(ProductDTO_.siebelId)) {
			entity.setSiebelId(data.getSiebelId());
		}
		if (data.isFieldChanged(ProductDTO_.categoryGroup)) {
			entity.setCategoryGroup(data.getCategoryGroup());
		}
		if (data.isFieldChanged(ProductDTO_.fullName)) {
			entity.setFullName(data.getFullName());
		}
		if (data.isFieldChanged(ProductDTO_.insuranceTypeAdm)) {
			entity.setInsuranceTypeAdm(
					data.getInsuranceTypeAdm().getValues()
							.stream()
							.map(v -> InsuranceTypeAdmEnum.getByValue(v.getValue()))
							.collect(Collectors.toSet()));
		}
		if (data.isFieldChanged(ProductDTO_.fixedPaymentDateFlag)) {
			entity.setFixedPaymentDateFlag(data.getFixedPaymentDateFlag());
		}
		if (data.isFieldChanged(ProductDTO_.annuityDeviationPercent)) {
			entity.setAnnuityDeviationPercent(data.getAnnuityDeviationPercent());
		}
		if (data.isFieldChanged(ProductDTO_.annuityDeviationCrCur)) {
			entity.setAnnuityDeviationCrCur(data.getAnnuityDeviationCrCur());
		}
		if (data.isFieldChanged(ProductDTO_.instantCardIssueFlg)) {
			entity.setInstantCardIssueFlg(data.getInstantCardIssueFlg());
		}
		if (data.isFieldChanged(ProductDTO_.vIPAvailableFlag)) {
			entity.setVIPAvailableFlag(data.getVIPAvailableFlag());
		}
		if (data.isFieldChanged(ProductDTO_.rBNamedCardIssueAvailability)) {
			entity.setRBNamedCardIssueAvailability(data.getRBNamedCardIssueAvailability());
		}
		if (data.isFieldChanged(ProductDTO_.reducedPaymentFlg)) {
			entity.setReducedPaymentFlg(data.getReducedPaymentFlg());
		}
		if (data.isFieldChanged(ProductDTO_.spouseTotalIncomeFlg)) {
			entity.setSpouseTotalIncomeFlg(data.getSpouseTotalIncomeFlg());
		}
		if (data.isFieldChanged(ProductDTO_.rBValidityPeriod)) {
			entity.setRBValidityPeriod(data.getRBValidityPeriod());
		}
		if (data.isFieldChanged(ProductDTO_.acceptExpireDateUnit)) {
			entity.setAcceptExpireDateUnit(data.getAcceptExpireDateUnit());
		}
		if (data.isFieldChanged(ProductDTO_.offerExpireDateUnit)) {
			entity.setOfferExpireDateUnit(data.getOfferExpireDateUnit());
		}
		if (data.isFieldChanged(ProductDTO_.acceptExpireDate)) {
			entity.setAcceptExpireDate(data.getAcceptExpireDate());
		}
		if (data.isFieldChanged(ProductDTO_.offerExpireDate)) {
			entity.setOfferExpireDate(data.getOfferExpireDate());
		}
		if (data.isFieldChanged(ProductDTO_.gBCLimitOperationType)) {
			entity.setGBCLimitOperationType(data.getGBCLimitOperationType());
		}
		if (data.isFieldChanged(ProductDTO_.categoryGroupGeneral)) {
			entity.setCategoryGroupGeneral(data.getCategoryGroupGeneral());
		}
		if (data.isFieldChanged(ProductDTO_.pledgeNumMin)) {
			entity.setPledgeNumMin(data.getPledgeNumMin());
		}
		if (data.isFieldChanged(ProductDTO_.guarantorNumMin)) {
			entity.setGuarantorNumMin(data.getGuarantorNumMin());
		}
		if (data.isFieldChanged(ProductDTO_.guarantorNumMax)) {
			entity.setGuarantorNumMax(data.getGuarantorNumMax());
		}
		if (data.isFieldChanged(ProductDTO_.pledgeNumMax)) {
			entity.setPledgeNumMax(data.getPledgeNumMax());
		}
		if (data.isFieldChanged(ProductDTO_.pledgeType)) {
			entity.setPledgeType(
					data.getPledgeType().getValues()
							.stream()
							.map(v -> PledgeTypeEnum.getByValue(v.getValue()))
							.collect(Collectors.toSet()));
		}
		if (data.isFieldChanged(ProductDTO_.incomeConfirmType)) {
			entity.setIncomeConfirmType(
					data.getIncomeConfirmType().getValues()
							.stream()
							.map(v -> IncomeConfirmTypeEnum.getByValue(v.getValue()))
							.collect(Collectors.toSet()));
		}
		if (data.isFieldChanged(ProductDTO_.ratioLoanDepositTerm)) {
			entity.setRatioLoanDepositTerm(data.getRatioLoanDepositTerm());
		}
		if (data.isFieldChanged(ProductDTO_.defaultCurrency)) {
			entity.setDefaultCurrency(data.getDefaultCurrency());
		}
		if (data.isFieldChanged(ProductDTO_.currency)) {
			entity.setCurrency(
					data.getCurrency().getValues()
							.stream()
							.map(v -> CurrencyEnum.getByValue(v.getValue()))
							.collect(Collectors.toSet()));
		}
		if (data.isFieldChanged(ProductDTO_.preapproveProduct)) {
			entity.setPreapproveProduct(data.getPreapproveProduct());
		}
		if (data.isFieldChanged(ProductDTO_.riskSegment)) {
			entity.setRiskSegment(data.getRiskSegment());
		}
		if (data.isFieldChanged(ProductDTO_.rMReviewDate)) {
			entity.setRMReviewDate(data.getRMReviewDate());
		}
		if (data.isFieldChanged(ProductDTO_.loanTypeBIS)) {
			entity.setLoanTypeBIS(data.getLoanTypeBIS());
		}
		if (data.isFieldChanged(ProductDTO_.riskGroupBIS)) {
			entity.setRiskGroupBIS(data.getRiskGroupBIS());
		}
		if (data.isFieldChanged(ProductDTO_.convertationCorrectionCodeBIS)) {
			entity.setConvertationCorrectionCodeBIS(data.getConvertationCorrectionCodeBIS());
		}
		if (data.isFieldChanged(ProductDTO_.maxDeviateAmount)) {
			entity.setMaxDeviateAmount(data.getMaxDeviateAmount());
		}
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<ProductDTO> getActions() {
		return Actions.<ProductDTO>builder()
				.save().text("Сохранить")
				.add()
				.build();
	}

}
