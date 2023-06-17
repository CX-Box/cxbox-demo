package org.demo.service.productEngine;

import static java.util.Optional.ofNullable;
import static org.demo.repository.MatrixItemRepository.attractionCloseChannelIsNull;
import static org.demo.repository.MatrixItemRepository.byCollateralFlg;
import static org.demo.repository.MatrixItemRepository.byIdNotNull;
import static org.demo.repository.MatrixItemRepository.byMatrixType;
import static org.demo.repository.MatrixItemRepository.byProductCode;
import static org.demo.repository.MatrixItemRepository.byProductId;
import static org.demo.repository.MatrixItemRepository.bySumBetween;
import static org.demo.repository.MatrixItemRepository.byTermBetween;
import static org.demo.repository.MatrixItemRepository.inAttractionCloseChannel;
import static org.demo.repository.MatrixItemRepository.inEmployerCategory;
import static org.demo.repository.MatrixItemRepository.inInsuranceType;
import static org.demo.repository.MatrixItemRepository.inMar1;
import static org.demo.repository.MatrixItemRepository.inMar2;
import static org.demo.repository.MatrixItemRepository.inMar3;
import static org.demo.repository.MatrixItemRepository.inMar4;
import static org.demo.repository.MatrixItemRepository.inSalaryClient;
import static org.demo.repository.MatrixItemRepository.inTariffCode;
import static org.demo.repository.MatrixItemRepository.incConfDocType;
import static org.demo.repository.MatrixItemRepository.minSumAndMaxSumIsNull;

import io.hypersistence.utils.hibernate.query.SQLExtractor;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import lombok.extern.slf4j.Slf4j;
import org.demo.entity.MatrixItem;
import org.demo.entity.Product;
import org.demo.entity.Sale;
import org.demo.entity.enums.CollateralAvailabilityEnum;
import org.demo.entity.enums.EmployerCategoryEnum;
import org.demo.entity.enums.MarketingSegment1Enum;
import org.demo.entity.enums.MarketingSegment2Enum;
import org.demo.entity.enums.MarketingSegment3Enum;
import org.demo.entity.enums.MarketingSegment4Enum;
import org.demo.entity.enums.MatrixTypeEnum;
import org.demo.entity.enums.ReqCurrencyEnum;
import org.demo.entity.enums.YesNoEnum;
import org.demo.repository.MatrixItemRepository;
import org.demo.repository.ProductRepository;
import org.demo.repository.SaleRepository;
import org.hibernate.query.ParameterMetadata;
import org.hibernate.query.Query;
import org.jetbrains.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ProductEngine {

	private static final YesNoEnum DEFAULT_SALARY_CLIENT = YesNoEnum.NO;

	private static final MarketingSegment1Enum DEFAULT_MKTG_SEGMENT1 = MarketingSegment1Enum.NLT;

	private static final MarketingSegment2Enum DEFAULT_MKTG_SEGMENT2 = MarketingSegment2Enum.NLT;

	private static final MarketingSegment3Enum DEFAULT_MKTG_SEGMENT3 = MarketingSegment3Enum.NLT;

	private static final MarketingSegment4Enum DEFAULT_MKTG_SEGMENT4 = MarketingSegment4Enum.NLT;

	private static final EmployerCategoryEnum DEFAULT_EMPLOYEE_CATEGORY = EmployerCategoryEnum.Other;

	@Autowired
	private MatrixItemRepository matrixItemRepository;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private SaleRepository saleRepository;

	@Autowired
	private EntityManager entityManager;

	public MatrixQueryParams calcCalculationMatrixItemQueryParams(Long calcId, MatrixTypeEnum matrixTypeEnum) {
		Sale calc = saleRepository.getById(calcId);
		return new MatrixQueryParams()
				.setMatrixTypeEnum(matrixTypeEnum)
				.setSalaryClient(DEFAULT_SALARY_CLIENT)
				.setMarketingSegment1(DEFAULT_MKTG_SEGMENT1)
				.setMarketingSegment2(DEFAULT_MKTG_SEGMENT2)
				.setMarketingSegment3(DEFAULT_MKTG_SEGMENT3)
				.setMarketingSegment4(DEFAULT_MKTG_SEGMENT4)
				.setEmployerCategory(DEFAULT_EMPLOYEE_CATEGORY)
				.setMacroproduct(calc.getMacroproduct())
				.setProductCode(ofNullable(calc.getReqProduct()).map(Product::getProductCode).orElse(null))
				.setProductId(ofNullable(calc.getReqProduct()).map(Product::getId).orElse(null))
				.setHasCollateralFlg(ofNullable(calc.getCollateralAvailability()).map(e -> e.equals(CollateralAvailabilityEnum.PLEDGE))
						.orElse(null))
				.setTerm(calc.getReqTerm())
				.setAmount(calc.getReqAmount())
				.setCurrency(calc.getReqCurrency())
				.setCardCategory(calc.getCardCategory())
				.setRiskSegment(ofNullable(calc.getReqProduct()).map(Product::getRiskSegment).orElse(null));
	}

	public MatrixQueryParams calcProductMatrixItemQueryParams(Long calcId, MatrixTypeEnum matrixTypeEnum) {
		Sale calc = saleRepository.getById(calcId);
		return new MatrixQueryParams()
				.setMatrixTypeEnum(matrixTypeEnum)
				.setSalaryClient(DEFAULT_SALARY_CLIENT)
				.setMarketingSegment1(DEFAULT_MKTG_SEGMENT1)
				.setMarketingSegment2(DEFAULT_MKTG_SEGMENT2)
				.setMarketingSegment3(DEFAULT_MKTG_SEGMENT3)
				.setMarketingSegment4(DEFAULT_MKTG_SEGMENT4)
				.setEmployerCategory(DEFAULT_EMPLOYEE_CATEGORY)
				.setMacroproduct(calc.getMacroproduct())
				.setProductCode(ofNullable(calc.getReqProduct()).map(Product::getProductCode).orElse(null))
				.setProductId(ofNullable(calc.getReqProduct()).map(Product::getId).orElse(null))
				.setHasCollateralFlg(ofNullable(calc.getCollateralAvailability()).map(e -> e.equals(CollateralAvailabilityEnum.PLEDGE))
						.orElse(null))
				.setTerm(calc.getReqTerm())
				.setAmount(calc.getReqAmount())
				.setCurrency(calc.getReqCurrency())
				.setCardCategory(calc.getCardCategory())
				.setRiskSegment(ofNullable(calc.getReqProduct()).map(Product::getRiskSegment).orElse(null));
	}

	public ResultDto productEngineRun(MatrixQueryParams params) {
		List<Specification<MatrixItem>> ss = new ArrayList<>();
		ofNullable(params.getMacroproduct()).ifPresent(e -> ss.add(MatrixItemRepository.byMacroProduct(e)));

		if (params.getAttractionCloseChannel() != null) {
			ss.add(inAttractionCloseChannel(params.getAttractionCloseChannel()));
		} else {
			ss.add(attractionCloseChannelIsNull());
		}

		if (params.getAmount() != null) {
			ss.add(bySumBetween(params.getAmount()));
			/** TODO>>!!!
			 * else if(sMatrixType=="ErrorMatrix")
			 * sSearchExpr+="[Min Sum] IS NULL AND [Max Sum] IS NULL AND";
			 *  break;
			 */
		} else {
			ss.add(minSumAndMaxSumIsNull());
		}

		ofNullable(params.getTerm()).ifPresent(e -> ss.add(byTermBetween(e)));

		if (params.getProductCode() != null) {
			if (params.getProductId() != null) {
				ss.add(byProductId(params.getProductId()));
			} else {
				ss.add(byProductCode(params.getProductCode()));
			}
		}
		ofNullable(params.getMatrixTypeEnum()).ifPresent(e -> ss.add(byMatrixType(e)));
		ofNullable(params.getMarketingSelectNum()).ifPresent(e -> ss.add(inTariffCode(e)));
		ofNullable(params.getHasCollateralFlg()).ifPresent(e -> ss.add(byCollateralFlg(e)));
		ofNullable(params.getInsuranceType()).ifPresent(e -> ss.add(inInsuranceType(e)));
		ofNullable(params.getSalaryClient()).ifPresent(e -> ss.add(inSalaryClient(e)));
		ofNullable(params.getMarketingSegment1()).ifPresent(e -> ss.add(inMar1(e)));
		ofNullable(params.getMarketingSegment2()).ifPresent(e -> ss.add(inMar2(e)));
		ofNullable(params.getMarketingSegment3()).ifPresent(e -> ss.add(inMar3(e)));
		ofNullable(params.getMarketingSegment4()).ifPresent(e -> ss.add(inMar4(e)));
		ofNullable(params.getEmployerCategory()).ifPresent(e -> ss.add(inEmployerCategory(e)));
		ofNullable(params.getIncomeConfirmDocumentType()).ifPresent(e -> ss.add(incConfDocType(e)));
		ofNullable(params.getCurrency()).ifPresent(e -> ss.add(MatrixItemRepository.inCurr(e)));
		ofNullable(params.getCardCategory()).ifPresent(e -> ss.add(MatrixItemRepository.inCardCat(e)));
		ofNullable(params.getCardType()).ifPresent(e -> ss.add(MatrixItemRepository.inCardType(e)));
		ofNullable(params.getRiskSegment()).ifPresent(e -> ss.add(MatrixItemRepository.inRiskSegment(e)));

		Specification<MatrixItem> spec = ss.stream().reduce(Specification::and).orElse(byIdNotNull());
		TypedQuery<MatrixItem> typedQuery = getTypedQuery(spec);
		if (typedQuery == null) {
			return null;
		}
		Query unwrap = typedQuery.unwrap(Query.class);
		String jpql = unwrap.getQueryString();

		String jpqlParams = unwrap.getParameters().stream()
				.map(e -> e.getName() != null ? (e.getName() + "[" + unwrap.getParameterValue(e.getName()) + "]") : "")
				.collect(Collectors.joining(","));
		log.info(jpql + " with params " + jpqlParams);
		String sql = SQLExtractor.from(typedQuery);
		return new ResultDto().setMatrixItems(typedQuery.getResultList()).setSql(sql).setJpql(jpql);
	}


	@Nullable
	private TypedQuery<MatrixItem> getTypedQuery(Specification<MatrixItem> spec) {
		CriteriaBuilder builder = entityManager.getCriteriaBuilder();
		CriteriaQuery<MatrixItem> query = builder.createQuery(MatrixItem.class);

		Root<MatrixItem> root = query.from(MatrixItem.class);

		if (spec == null) {
			return null;
		}

		Predicate predicate = spec.toPredicate(root, query, builder);

		if (predicate != null) {
			query.where(predicate);
		}
		query.select(root);

		return entityManager.createQuery(query);
	}

}
