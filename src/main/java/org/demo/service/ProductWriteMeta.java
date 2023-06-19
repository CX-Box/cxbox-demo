package org.demo.service;

import java.util.Arrays;
import org.cxbox.core.dto.DrillDownType;
import org.demo.controller.CxboxRestController;
import org.demo.dto.ProductDTO;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.ProductDTO_;
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
import org.demo.entity.enums.StatusEnum;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ProductWriteMeta extends FieldMetaBuilder<ProductDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ProductDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(ProductDTO_.gBCCheckedFlg);
		fields.setEnabled(ProductDTO_.notDSA);
		fields.setEnabled(ProductDTO_.nonStandartFlag);
		fields.setEnabled(ProductDTO_.version);
		fields.setEnabled(ProductDTO_.endDate);
		fields.setEnabled(ProductDTO_.startDate);
		fields.setEnumValues(ProductDTO_.status, StatusEnum.values());
		fields.setEnabled(ProductDTO_.status);
		fields.setEnumValues(ProductDTO_.macroProduct, MacroProduct.values());
		fields.setEnabled(ProductDTO_.macroProduct);
		fields.setEnabled(ProductDTO_.productCode);
		fields.setEnabled(ProductDTO_.siebelId);
		fields.setEnumValues(ProductDTO_.categoryGroup, CategoryGroupEnum.values());
		fields.setEnabled(ProductDTO_.categoryGroup);
		fields.setEnabled(ProductDTO_.fullName);
		fields.setDictionaryTypeWithCustomValues(ProductDTO_.insuranceTypeAdm, Arrays.stream(InsuranceTypeAdmEnum.values())
				.map(InsuranceTypeAdmEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(ProductDTO_.insuranceTypeAdm);
		fields.setEnabled(ProductDTO_.fixedPaymentDateFlag);
		fields.setEnabled(ProductDTO_.annuityDeviationPercent);
		fields.setEnabled(ProductDTO_.annuityDeviationCrCur);
		fields.setEnabled(ProductDTO_.instantCardIssueFlg);
		fields.setEnabled(ProductDTO_.vIPAvailableFlag);
		fields.setEnumValues(ProductDTO_.rBNamedCardIssueAvailability, RBNamedCardIssueAvailabilityEnum.values());
		fields.setEnabled(ProductDTO_.rBNamedCardIssueAvailability);
		fields.setEnabled(ProductDTO_.reducedPaymentFlg);
		fields.setEnabled(ProductDTO_.spouseTotalIncomeFlg);
		fields.setEnabled(ProductDTO_.rBValidityPeriod);
		fields.setEnumValues(ProductDTO_.acceptExpireDateUnit, ExpireDateUnitEnum.values());
		fields.setEnabled(ProductDTO_.acceptExpireDateUnit);
		fields.setEnumValues(ProductDTO_.offerExpireDateUnit, ExpireDateUnitEnum.values());
		fields.setEnabled(ProductDTO_.offerExpireDateUnit);
		fields.setEnabled(ProductDTO_.acceptExpireDate);
		fields.setEnabled(ProductDTO_.offerExpireDate);
		fields.setEnumValues(ProductDTO_.gBCLimitOperationType, GBCLimitOperationTypeEnum.values());
		fields.setEnabled(ProductDTO_.gBCLimitOperationType);
		fields.setEnumValues(ProductDTO_.categoryGroupGeneral, CategoryGroupGeneralEnum.values());
		fields.setEnabled(ProductDTO_.categoryGroupGeneral);
		fields.setEnabled(ProductDTO_.pledgeNumMin);
		fields.setEnabled(ProductDTO_.guarantorNumMin);
		fields.setEnabled(ProductDTO_.guarantorNumMax);
		fields.setEnabled(ProductDTO_.pledgeNumMax);
		fields.setDictionaryTypeWithCustomValues(ProductDTO_.pledgeType, Arrays.stream(PledgeTypeEnum.values())
				.map(PledgeTypeEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(ProductDTO_.pledgeType);
		fields.setDictionaryTypeWithCustomValues(
				ProductDTO_.incomeConfirmType,
				Arrays.stream(IncomeConfirmTypeEnum.values())
						.map(IncomeConfirmTypeEnum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(ProductDTO_.incomeConfirmType);
		fields.setEnabled(ProductDTO_.ratioLoanDepositTerm);
		fields.setEnumValues(ProductDTO_.defaultCurrency, CurrencyEnum.values());
		fields.setEnabled(ProductDTO_.defaultCurrency);
		fields.setDictionaryTypeWithCustomValues(ProductDTO_.currency, Arrays.stream(CurrencyEnum.values())
				.map(CurrencyEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(ProductDTO_.currency);
		fields.setEnumValues(ProductDTO_.preapproveProduct, PreapproveProductEnum.values());
		fields.setEnabled(ProductDTO_.preapproveProduct);
		fields.setEnabled(ProductDTO_.riskSegment);
		fields.setEnabled(ProductDTO_.rMReviewDate);
		fields.setEnabled(ProductDTO_.loanTypeBIS);
		fields.setEnabled(ProductDTO_.riskGroupBIS);
		fields.setEnabled(ProductDTO_.convertationCorrectionCodeBIS);
		fields.setEnabled(ProductDTO_.maxDeviateAmount);

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ProductDTO> fields, InnerBcDescription bcDescription, Long parentId) {
		fields.setEnumFilterValues(fields, ProductDTO_.categoryGroup, CategoryGroupEnum.values());
		fields.enableFilter(ProductDTO_.categoryGroup);
		fields.enableFilter(ProductDTO_.fullName);
		fields.enableFilter(ProductDTO_.insuranceTypeAdm);
		fields.enableFilter(ProductDTO_.fixedPaymentDateFlag);
		fields.enableFilter(ProductDTO_.annuityDeviationPercent);
		fields.enableFilter(ProductDTO_.annuityDeviationCrCur);
		fields.enableFilter(ProductDTO_.instantCardIssueFlg);
		fields.enableFilter(ProductDTO_.vIPAvailableFlag);
		fields.setEnumFilterValues(
				fields,
				ProductDTO_.rBNamedCardIssueAvailability,
				RBNamedCardIssueAvailabilityEnum.values()
		);
		fields.enableFilter(ProductDTO_.rBNamedCardIssueAvailability);
		fields.enableFilter(ProductDTO_.reducedPaymentFlg);
		fields.enableFilter(ProductDTO_.spouseTotalIncomeFlg);
		fields.enableFilter(ProductDTO_.rBValidityPeriod);
		fields.setEnumFilterValues(fields, ProductDTO_.acceptExpireDateUnit, ExpireDateUnitEnum.values());
		fields.enableFilter(ProductDTO_.acceptExpireDateUnit);
		fields.setEnumFilterValues(fields, ProductDTO_.offerExpireDateUnit, ExpireDateUnitEnum.values());
		fields.enableFilter(ProductDTO_.offerExpireDateUnit);
		fields.enableFilter(ProductDTO_.acceptExpireDate);
		fields.enableFilter(ProductDTO_.offerExpireDate);
		fields.setEnumFilterValues(fields, ProductDTO_.gBCLimitOperationType, GBCLimitOperationTypeEnum.values());
		fields.enableFilter(ProductDTO_.gBCLimitOperationType);
		fields.setEnumFilterValues(fields, ProductDTO_.categoryGroupGeneral, CategoryGroupGeneralEnum.values());
		fields.enableFilter(ProductDTO_.categoryGroupGeneral);
		fields.enableFilter(ProductDTO_.pledgeNumMin);
		fields.enableFilter(ProductDTO_.guarantorNumMin);
		fields.enableFilter(ProductDTO_.guarantorNumMax);
		fields.enableFilter(ProductDTO_.pledgeNumMax);
		fields.enableFilter(ProductDTO_.pledgeType);
		fields.enableFilter(ProductDTO_.incomeConfirmType);
		fields.enableFilter(ProductDTO_.ratioLoanDepositTerm);
		fields.setEnumFilterValues(fields, ProductDTO_.defaultCurrency, CurrencyEnum.values());
		fields.enableFilter(ProductDTO_.defaultCurrency);
		fields.enableFilter(ProductDTO_.currency);
		fields.setEnumFilterValues(fields, ProductDTO_.preapproveProduct, PreapproveProductEnum.values());
		fields.enableFilter(ProductDTO_.preapproveProduct);
		fields.enableFilter(ProductDTO_.riskSegment);
		fields.enableFilter(ProductDTO_.rMReviewDate);
		fields.enableFilter(ProductDTO_.loanTypeBIS);
		fields.enableFilter(ProductDTO_.riskGroupBIS);
		fields.enableFilter(ProductDTO_.convertationCorrectionCodeBIS);
		fields.enableFilter(ProductDTO_.maxDeviateAmount);

	}

}
