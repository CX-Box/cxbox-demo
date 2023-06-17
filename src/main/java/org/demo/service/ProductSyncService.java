package org.demo.service;

import com.google.common.base.Splitter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.Actions;
import org.demo.controller.CxboxRestController;
import org.demo.dto.ProductSyncDTO;
import org.demo.dto.ProductSyncDTO_;
import org.demo.entity.MatrixItem;
import org.demo.entity.Product;
import org.demo.entity.ProductSync;
import org.demo.entity.enums.ATCScheduleTypeEnum;
import org.demo.entity.enums.AttractionCloseChannelEnum;
import org.demo.entity.enums.CardCategoryEnum;
import org.demo.entity.enums.CardTypeEnum;
import org.demo.entity.enums.CategoryGroupEnum;
import org.demo.entity.enums.CategoryGroupGeneralEnum;
import org.demo.entity.enums.CurrencyEnum;
import org.demo.entity.enums.EmployerCategoryEnum;
import org.demo.entity.enums.ExpireDateUnitEnum;
import org.demo.entity.enums.GBCLoanCategoryEnum;
import org.demo.entity.enums.IncomeConfirmTypeEnum;
import org.demo.entity.enums.InsuranceTypeAdmEnum;
import org.demo.entity.enums.MacroProduct;
import org.demo.entity.enums.MarketingSegment1Enum;
import org.demo.entity.enums.MarketingSegment2Enum;
import org.demo.entity.enums.MarketingSegment3Enum;
import org.demo.entity.enums.MarketingSegment4Enum;
import org.demo.entity.enums.MatrixTypeEnum;
import org.demo.entity.enums.ParticipantTypesEnum;
import org.demo.entity.enums.PledgeTypeEnum;
import org.demo.entity.enums.PreapproveProductEnum;
import org.demo.entity.enums.ProofOfIncomeEnum;
import org.demo.entity.enums.RiskSegmentEnum;
import org.demo.entity.enums.TargetOpenSystemEnum;
import org.demo.entity.enums.YesNoEnum;
import org.demo.entity.enums.StatusEnum;
import org.demo.repository.ProductRepository;
import org.demo.siebel.product.gen.ATCProductAvailableCurrency;
import org.demo.siebel.product.gen.ATCProductIncomeConfirmType;
import org.demo.siebel.product.gen.ATCProductPledgeType;
import org.demo.siebel.product.gen.AtcProduct;
import org.demo.siebel.product.gen.ListOfATCProductAvailableCurrency;
import org.demo.siebel.product.gen.ListOfATCProductIncomeConfirmType;
import org.demo.siebel.product.gen.ListOfATCProductPledgeType;
import org.demo.siebel.product.gen.ListOfAtcProductMatrixItem;
import org.demo.siebel.product.gen.Run1Input;
import org.demo.siebel.product.gen.Run1Output;
import org.demo.soap.ProductClient;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.stereotype.Service;

@Slf4j
@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ProductSyncService extends VersionAwareResponseService<ProductSyncDTO, ProductSync> {


	private final ProductClient productClient;

	private final ProductRepository productRepository;

	public ProductSyncService(ProductClient productClient, ProductRepository productRepository) {
		super(ProductSyncDTO.class, ProductSync.class, null, ProductSyncMeta.class);
		this.productClient = productClient;
		this.productRepository = productRepository;
	}

	@Override
	protected CreateResult<ProductSyncDTO> doCreateEntity(ProductSync entity, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	protected ActionResultDTO<ProductSyncDTO> doUpdateEntity(ProductSync entity, ProductSyncDTO data,
			BusinessComponent bc) {
		if (data.isFieldChanged(ProductSyncDTO_.pageSize)) {
			entity.setPageSize(data.getPageSize());
		}
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<ProductSyncDTO> getActions() {

		return Actions.<ProductSyncDTO>builder().action("sync", "Синхронизировать с Siebel").invoker((bc, dto) -> {
			Run1Input request = new Run1Input();
			if (dto.getPageSize() != null) {
				request.setPageSize("" + dto.getPageSize());
			} else {
				request.setPageSize("10");
			}
			request.setSortSpec("Updated(DESC)");

			request.setStartRowNum("0");
			Run1Output products = productClient.getProducts(request);
			if (products != null && products.getListOfAtcProductAdministrationIo() != null
					&& products.getListOfAtcProductAdministrationIo().getAtcProduct() != null) {
				List<AtcProduct> siebelProducts = products.getListOfAtcProductAdministrationIo().getAtcProduct();
				List<String> siebelIds = siebelProducts.stream().map(e -> e.getId()).collect(Collectors.toList());
				List<Product> existingProducts = productRepository.findAllBySiebelIdIn(siebelIds);
				List<String> existingSiebelIds = existingProducts.stream().map(e -> e.getSiebelId())
						.collect(Collectors.toList());

				List<AtcProduct> notExistingSibelProducts = siebelProducts.stream().distinct()
						.filter(e -> !existingSiebelIds.contains(e.getId())).collect(Collectors.toList());

				notExistingSibelProducts.forEach(s -> {
					Product entity = new Product();
					Product product = mapProductAttributes(s, entity);
					productRepository.save(product);
				});

				List<AtcProduct> existingSibelProducts = siebelProducts.stream().distinct()
						.filter(e -> existingSiebelIds.contains(e.getId())).collect(Collectors.toList());

				existingSibelProducts.forEach(s -> {
					Product entity = existingProducts.stream().filter(p -> p.getSiebelId().equals(s.getId())).findAny()
							.orElse(null);
					Product product = mapProductAttributes(s, entity);
					productRepository.save(product);
				});
			}

			return new ActionResultDTO<ProductSyncDTO>().setAction(PostAction.refreshBc(CxboxRestController.product));
		}).available(bc -> true).withAutoSaveBefore().add().build();
	}

	private static Product mapProductAttributes(AtcProduct s, Product entity) {
		return entity
				.setProductCode(s.getProductCode())
				.setSiebelId(s.getId())
				.setShortName(s.getShortName())
				.setMacroProduct(MacroProduct.getByValue(s.getMacroproduct()))
				.setStatus(StatusEnum.getByValue(s.getStatus()))
				.setVersion(parseSiebelLong(s.getVersion()))
				.setNonStandartFlag(parseSiebelBoolean(s.getNonstandartFlag()))
				.setNotDSA(parseSiebelBoolean(s.getNotDSAFlg()))
				.setConvertationCorrectionCodeBIS(s.getConvertationCorrectionCodeBIS())
				.setRiskSegment(Optional.ofNullable(trim(s.getRiskSegment())).map(e -> RiskSegmentEnum.valueOf(e)).orElse(null))
				.setRiskGroupBIS(s.getRiskGroupBIS())
				.setMaxDeviateAmount(parseSiebelLong(s.getMaxDeviateAmount()))
				.setLoanTypeBIS(s.getLoanTypeBIS())
				.setFullName(s.getFullName())
				.setRMReviewDate(parseSiebelLong(s.getRMReviewDate()))
				.setPreapproveProduct(PreapproveProductEnum.getByValue(s.getATCPreapproveProduct()))
				.setCurrency(Optional.ofNullable(s.getListOfATCProductAvailableCurrency())
						.map(ListOfATCProductAvailableCurrency::getATCProductAvailableCurrency)
						.map(el -> el.stream()
								.map(ATCProductAvailableCurrency::getAvailableCurrency)
								.map(CurrencyEnum::valueOf)
								.collect(Collectors.toSet()))
						.orElse(null))
				.setDefaultCurrency(CurrencyEnum.valueOf(s.getDefaultCurrency()))
				.setRatioLoanDepositTerm(null)
				.setIncomeConfirmType(Optional.ofNullable(s.getListOfATCProductIncomeConfirmType())
						.map(ListOfATCProductIncomeConfirmType::getATCProductIncomeConfirmType)
						.map(el -> el.stream()
								.map(ATCProductIncomeConfirmType::getIncomeConfirmTypeLIC)
								.map(IncomeConfirmTypeEnum::getBySiebelLIC)
								.collect(Collectors.toSet()))
						.orElse(null))
				.setPledgeType(Optional.ofNullable(s.getListOfATCProductPledgeType())
						.map(ListOfATCProductPledgeType::getATCProductPledgeType)
						.map(el -> el.stream()
								.map(ATCProductPledgeType::getPledgeTypeLIC)
								.map(PledgeTypeEnum::getBySiebelLIC)
								.collect(Collectors.toSet()))
						.orElse(null))
				.setPledgeNumMin(parseSiebelLong(s.getPledgeNumMin()))
				.setPledgeNumMax(parseSiebelLong(s.getPledgeNumMax()))
				.setGuarantorNumMin(parseSiebelLong(s.getGuarantorNumMin()))
				.setGuarantorNumMax(parseSiebelLong(s.getGuarantorNumMax()))
				.setCategoryGroupGeneral(Optional.ofNullable(trim(s.getCategoryGroupGeneral2()))
						.map(CategoryGroupGeneralEnum::valueOf).orElse(null))
				.setOfferExpireDate(parseSiebelLong(s.getOfferExpireDate()))
				.setOfferExpireDateUnit(Optional.ofNullable(trim(s.getAcceptExpireDateUnit()))
						.map(ExpireDateUnitEnum::getByValue).orElse(null))
				.setAcceptExpireDate(parseSiebelLong(s.getAcceptExpireDate()))
				.setAcceptExpireDateUnit(Optional.ofNullable(trim(s.getAcceptExpireDateUnit()))
						.map(ExpireDateUnitEnum::getByValue).orElse(null))
				.setRBValidityPeriod(parseSiebelLong(s.getRBValidityPeriod()))
				.setReducedPaymentFlg(parseSiebelBoolean(s.getReducedPaymentFlg()))
				.setInstantCardIssueFlg(parseSiebelBoolean(s.getInstantCardIssueFlg()))
				.setFixedPaymentDateFlag(parseSiebelBoolean(s.getFixedPaymentDateFlag()))
				.setMatrixItems(Optional.ofNullable(s.getListOfAtcProductMatrixItem())
						.map(ListOfAtcProductMatrixItem::getAtcProductMatrixItem)
						.map(e -> e.stream()
								.map(el -> new MatrixItem()
										.setProduct(entity)
										.setSiebelId(el.getId())
										.setPriority(parseSiebelLong(el.getPriority()))
										.setCurrency(fromSiebelLicList(el.getCurrency2(), CurrencyEnum::valueOf))
										.setParticipantTypes(fromSiebelDisplayValueList(
												el.getParticipantTypes(),
												ParticipantTypesEnum::getByValue
										))
										.setAttractionCloseChannel(fromSiebelDisplayValueList(
												el.getAttractionCloseChannel(),
												AttractionCloseChannelEnum::getByValue
										))
										.setEmployerCategory(fromSiebelDisplayValueList(
												el.getEmployerCategory(),
												EmployerCategoryEnum::getByValue
										))
										.setRiskSegment(fromSiebelLicList(el.getRiskSegment2(), RiskSegmentEnum::valueOf))
										.setCategoryGroupGeneral(fromSiebelDisplayValueList(
												el.getCategoryGroupGeneral(),
												CategoryGroupGeneralEnum::valueOf
										))
										.setCategoryGroup(fromSiebelDisplayValueList(el.getCategoryGroup(), CategoryGroupEnum::valueOf))
										.setSalaryClient(fromSiebelDisplayValueList(el.getSalaryClient(), YesNoEnum::getByValue))
										.setMarketingSegment1(fromSiebelDisplayValueList(
												el.getMarketingSegment1(),
												MarketingSegment1Enum::getByValue
										))
										.setMarketingSegment2(fromSiebelDisplayValueList(
												el.getMarketingSegment2(),
												MarketingSegment2Enum::getByValue
										))
										.setMarketingSegment3(fromSiebelDisplayValueList(
												el.getMarketingSegment3(),
												MarketingSegment3Enum::getByValue
										))
										.setMarketingSegment4(fromSiebelDisplayValueList(
												el.getMarketingSegment4(),
												MarketingSegment4Enum::getByValue
										))
										.setIncomeConfirmDocumentType(fromSiebelDisplayValueListIgnoreUnknown(
												el.getIncomeConfirmDocumentType(),
												IncomeConfirmTypeEnum::getByValue
										))
										.setInsuranceType(fromSiebelDisplayValueList(
												el.getInsuranceType2(),
												InsuranceTypeAdmEnum::getByValue
										))
										.setRBSubsequentPledgeFlag(fromSiebelDisplayValueList(
												el.getRBSubsequentPledgeFlag(),
												YesNoEnum::getByValue
										))
										.setCardType(fromSiebelDisplayValueListIgnoreUnknown(el.getCardType(), CardTypeEnum::getByValue))
										.setCardCategory(fromSiebelDisplayValueListIgnoreUnknown(
												el.getCardCategory(),
												CardCategoryEnum::getByValue
										))
										.setMinTermMonths(parseSiebelLong(el.getMinTermMonths()))
										.setMaxTermMonths(parseSiebelLong(el.getMaxTermMonths()))
										.setMinSum(parseSiebelDouble(el.getMinSum()))
										.setMaxSum(parseSiebelDouble(el.getMaxSum()))
										.setProofOfIncome(fromSiebelDisplayValueList(el.getProofOfIncome(), ProofOfIncomeEnum::getByValue))
										.setTariffVersionPF(trim(el.getTariffVersionPF()))
										.setTariffNamePf(trim(el.getTariffNamePf()))
										.setDismissTariffNamePf(trim(el.getDismissTariffNamePf()))
										.setRatePercent(parseSiebelDouble(el.getRatePercent()))
										.setCashCreditRate(parseSiebelDouble(el.getCashCreditRate()))
										.setSpecCondRate(parseSiebelDouble(el.getSpecCondRate()))
										.setMinPercentRate(parseSiebelDouble(el.getMinPercentRate()))
										.setMinMonthlyPaymentForMainDebt(parseSiebelDouble(el.getMinMonthlyPaymentForMainDebt()))
										.setMinMounthPayment(parseSiebelDouble(el.getMinMounthPayment()))
										.setCashCommissionOverdraft(parseSiebelDouble(el.getCashCommissionOverdraft()))
										.setPenaltiesForNoCascoPf(trim(el.getPenaltiesForNoCascoPf()))
										.setPenaltiesForPaymDelayPf(trim(el.getPenaltiesForPaymDelayPf()))
										.setPaymentScheme(trim(el.getPaymentScheme()))
										.setGracePeriodMonth(parseSiebelLong(el.getGracePeriodMonth()))
										.setATCScheduleType(Optional.ofNullable(trim(el.getATCScheduleType()))
												.map(ATCScheduleTypeEnum::getByValue).orElse(null))
										.setMovePaymentDateFlg(parseSiebelBoolean(el.getMovePaymentDateFlg()))
										.setCardIssueCommission(parseSiebelDouble(el.getCardIssueCommission()))
										.setInstantCardCommission(parseSiebelDouble(el.getInstantCardCommission()))
										.setOnetimeCardCommission(parseSiebelDouble(el.getOnetimeCardComission()))
										.setMinCardServiceCommission(parseSiebelDouble(el.getMinCardServiceCommission()))
										.setMaxCardServiceCommission(parseSiebelDouble(el.getMaxCardServiceCommission()))
										.setFstYrCardCommission(parseSiebelDouble(el.getFstYrCardCommission()))
										.setSecondYrCardCommission(parseSiebelDouble(el.getSecondYrCardCommission()))
										.setThirdYrCard(parseSiebelDouble(el.getThirdYrCard()))
										.setFstYrCardCommissionPF(trim(el.getFstYrCardCommissionPF()))
										.setSecondYrCardCommissionPF(trim(el.getSecondYrCardCommissionPF()))
										.setThirdYrCardCommissionPF(trim(el.getThirdYrCardCommissionPF()))
										.setCashCommission(trim(el.getCashCommission()))
										.setOthbankMoneyComission(trim(el.getOthbankMoneyComission()))
										.setBISCardProductCode(trim(el.getBISCardProductCode()))
										.setBinRange(trim(el.getBinRange()))
										.setCardTariffCode(trim(el.getCardTariffCode()))
										.setLimitOperationSum(parseSiebelDouble(el.getLimitOperationSum()))
										.setARTProductCode(trim(el.getARTProductCode()))
										.setBISLoanCategory(trim(el.getBISLoanCategory()))
										.setTargetOpenSystem(Optional.ofNullable(trim(el.getTargetOpenSystem()))
												.map(TargetOpenSystemEnum::getByValue).orElse(null))
										.setRfResidentRequired(parseSiebelBoolean(el.getRfResidentRequired()))
										.setBankDivnJobAddress(parseSiebelBoolean(el.getBankDivnJobAddress()))
										.setBankDivnResidency(parseSiebelBoolean(el.getBankDivnResidency()))
										.setAdditionalIDRequired(parseSiebelBoolean(el.getAdditionalIDRequired()))
										.setJobRequired(parseSiebelBoolean(el.getJobRequired()))
										.setConfirmMarriageReq(parseSiebelBoolean(el.getConfirmMarriageReq()))
										.setMinTotalIncome(parseSiebelDouble(el.getMinTotalIncome()))
										.setMinMthsAtJobReg(parseSiebelLong(el.getMinMthsAtJobReg()))
										.setMinMthsAtJobNoreg(parseSiebelLong(el.getMinMthsAtJobNoreg()))
										.setMinAgeForMen(parseSiebelLong(el.getMinAgeForMen()))
										.setMaxAgeForMenApplication(parseSiebelLong(el.getMaxAgeForMenApplication()))
										.setMaxAgeForMenPaid(parseSiebelLong(el.getMaxAgeForMenPaid()))
										.setMinAgeForWomen(parseSiebelLong(el.getMinAgeForWomen()))
										.setMaxAgeForWomenApplication(parseSiebelLong(el.getMaxAgeForWomenApplication()))
										.setMaxAgeForWomenPaid(parseSiebelLong(el.getMaxAgeForWomenPaid()))
										.setBisClientCategory(trim(el.getBisClientCategory()))
										.setMaxPSKPerc(parseSiebelDouble(el.getMaxPSKPerc()))
										.setMinLoanSumRestriction(parseSiebelDouble(el.getMinLoanSumRestriction()))
										.setMaxLoanSumRestriction(parseSiebelDouble(el.getMaxLoanSumRestriction()))
										.setMinDepositSumRestriction(parseSiebelDouble(el.getMinDepositSumRestriction()))
										.setMaxDepositSumRestriction(parseSiebelDouble(el.getMaxDepositSumRestriction()))
										.setMinTermRestriction(parseSiebelLong(el.getMinTermRestriction()))
										.setMaxTermRestriction(parseSiebelLong(el.getMaxTermRestriction()))
										.setRefSumLoanRatio(parseSiebelDouble(el.getRefSumLoanRatio()))
										.setMaxAddSum(parseSiebelLong(el.getMaxAddSum()))
										.setMinAddSum(parseSiebelLong(el.getMinAddSum()))
										.setMinRefinSum(parseSiebelLong(el.getMinRefinSum()))
										.setMaxRefinSum(parseSiebelLong(el.getMaxRefinSum()))
										.setMaxDeviateAmount(parseSiebelDouble(el.getMaxDeviateAmount()))
										.setCreditTermPSK(parseSiebelDouble(el.getCreditTermPSK()))
										.setErrorCode(trim(el.getErrorCode()))
										.setErrorText(trim(el.getErrorText()))
										.setBankRate(parseSiebelDouble(el.getBankRate()))
										.setSpecialRateDiscount(parseSiebelDouble(el.getSpecialRateDiscount()))
										.setPreDisbursementCheckFlag(parseSiebelBoolean(el.getPreDisbursementCheckFlag()))
										.setElectronicCheck(parseSiebelBoolean(el.getElectronicCheck()))
										.setPreOfferCheck(parseSiebelBoolean(el.getPreOfferCheck()))
										.setDigitalProfileConsent(parseSiebelBoolean(el.getDigitalProfileConsent()))
										.setMatrixType(Optional.ofNullable(el.getMatrixType()).map(MatrixTypeEnum::getByValue).orElse(null))
								).collect(Collectors.toList())
						)
						.orElse(new ArrayList<>())
				);
	}

	private static String fromSiebelLicList(@Nullable String val, @NonNull Function<String, Enum> getByKey) {
		if (val == null || trim(val) == null) {
			return null;
		}
		return Optional.ofNullable(val)
				.map(e -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(e)
						.stream()
						.filter(el -> el != null && !el.replace(" ", "").isEmpty())
						.map(getByKey)
						.map(Enum::name)
						.collect(Collectors.joining(",", ",", ",")))
				.orElse(null);
	}

	private static String fromSiebelDisplayValueListIgnoreUnknown(@Nullable String val,
			@NonNull Function<String, Enum> getByValue) {
		if (val == null || trim(val) == null) {
			return null;
		}
		return Optional.ofNullable(val)
				.map(e -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(e)
						.stream()
						.filter(el -> el != null && !el.replace(" ", "").isEmpty())
						.map(getByValue)
						.filter(Objects::nonNull)
						.map(Enum::name)
						.collect(Collectors.joining(",", ",", ",")))
				.orElse(null);
	}

	private static String fromSiebelDisplayValueList(@Nullable String val,
			@NonNull Function<String, Enum> getByValue) {
		if (val == null || trim(val) == null) {
			return null;
		}
		return Optional.ofNullable(val)
				.map(e -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(e)
						.stream()
						.filter(el -> el != null && !el.replace(" ", "").isEmpty())
						.map(el -> {
							Enum apply = getByValue.apply(el);
							if (apply == null) {
								log.error("not found el = " + el);
								throw new IllegalStateException();
							}
							return apply;
						})
						.map(Enum::name)
						.collect(Collectors.joining(",", ",", ",")))
				.orElse(null);
	}

	@NotNull
	private static Stream<String> splitByComma(String commaSeparatedValue) {
		return Arrays.stream(commaSeparatedValue.split(",")).filter(e -> !e.equals(",") && !e.replace(" ", "").isEmpty());
	}

	public static String trim(String s) {
		if (s == null || s.replace(" ", "").isEmpty()) {
			return null;
		}
		return s;
	}

	public static Boolean parseSiebelBoolean(String s) {
		if (s == null || s.replace(" ", "").isEmpty()) {
			return null;
		}
		return "true".equalsIgnoreCase(s) || "Y".equalsIgnoreCase(s);
	}

	public static Long parseSiebelLong(String s) {
		if (s == null || s.replace(" ", "").isEmpty()) {
			return null;
		}
		return Long.parseLong(s);
	}

	public static Double parseSiebelDouble(String s) {
		if (s == null || s.replace(" ", "").isEmpty()) {
			return null;
		}
		return Double.parseDouble(s);
	}

}
