package org.demo.repository;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import org.demo.entity.MatrixItem;
import org.demo.entity.MatrixItem_;
import org.demo.entity.Product_;
import org.demo.entity.enums.CardCategoryEnum;
import org.demo.entity.enums.CardTypeEnum;
import org.demo.entity.enums.EmployerCategoryEnum;
import org.demo.entity.enums.IncomeConfirmTypeEnum;
import org.demo.entity.enums.MacroProduct;
import org.demo.entity.enums.MarketingSegment1Enum;
import org.demo.entity.enums.MarketingSegment2Enum;
import org.demo.entity.enums.MarketingSegment3Enum;
import org.demo.entity.enums.MarketingSegment4Enum;
import org.demo.entity.enums.MatrixTypeEnum;
import org.demo.entity.enums.ReqCurrencyEnum;
import org.demo.entity.enums.RiskSegmentEnum;
import org.demo.entity.enums.TypeCalcEnum;
import org.demo.entity.enums.YesNoEnum;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MatrixItemRepository extends JpaRepository<MatrixItem, Long>, JpaSpecificationExecutor<MatrixItem> {

	static Specification<MatrixItem> byMatrixType(MatrixTypeEnum en) {
		return (r, q, b) -> b.equal(r.get(MatrixItem_.matrixType), en);
	}
	static Specification<MatrixItem> inRiskSegment(RiskSegmentEnum en) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.riskSegment), en.name());
	}

	static Specification<MatrixItem> inCardType(CardTypeEnum en) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.cardType), en.name());
	}

	static Specification<MatrixItem> inCardCat(CardCategoryEnum en) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.cardCategory), en.name());
	}

	static Specification<MatrixItem> inCurr(ReqCurrencyEnum en) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.currency), en.name());
	}

	static Specification<MatrixItem> incConfDocType(IncomeConfirmTypeEnum en) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.incomeConfirmDocumentType), en.name());
	}

	static Specification<MatrixItem> inEmployerCategory(EmployerCategoryEnum en) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.employerCategory), en.name());
	}

	static Specification<MatrixItem> inMar1(MarketingSegment1Enum en) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.marketingSegment1), en.name());
	}

	static Specification<MatrixItem> inMar2(MarketingSegment2Enum en) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.marketingSegment2), en.name());
	}

	static Specification<MatrixItem> inMar3(MarketingSegment3Enum en) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.marketingSegment3), en.name());
	}

	static Specification<MatrixItem> inMar4(MarketingSegment4Enum en) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.marketingSegment4), en.name());
	}

	static Specification<MatrixItem> inSalaryClient(YesNoEnum salaryClient) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.salaryClient), salaryClient.name());
	}

	static Specification<MatrixItem> inInsuranceType(String insuranceType) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.insuranceType), insuranceType);
	}

	static Specification<MatrixItem> inTariffCode(String tariffCode) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.tariffCode), tariffCode);
	}

	static Specification<MatrixItem> byProductId(Long productId) {
		return (r, q, b) -> b.equal(r.get(MatrixItem_.product).get(Product_.id), productId);
	}

	static Specification<MatrixItem> byProductCode(String productCode) {
		return (r, q, b) -> b.equal(r.get(MatrixItem_.product).get(Product_.productCode), productCode);
	}

	static Specification<MatrixItem> byTermBetween(Long term) {
		return (r, q, b) -> betweenIncluding(term, b, r.get(MatrixItem_.minTermMonths), r.get(MatrixItem_.maxTermMonths));
	}

	static Specification<MatrixItem> bySumBetween(Double sum) {
		return (r, q, b) -> betweenIncluding(sum, b, r.get(MatrixItem_.minSum), r.get(MatrixItem_.maxSum));
	}

	static Specification<MatrixItem> minSumAndMaxSumIsNull() {
		return (r, q, b) -> b.or(r.get(MatrixItem_.minSum).isNull(), r.get(MatrixItem_.maxSum).isNull());
	}

	static Specification<MatrixItem> attractionCloseChannelIsNull() {
		return (r, q, b) -> r.get(MatrixItem_.attractionCloseChannel).isNull();
	}

	static Specification<MatrixItem> inAttractionCloseChannel(String attractionCloseChannel) {
		return (r, q, b) -> inCommaListOrNull(b, r.get(MatrixItem_.attractionCloseChannel), attractionCloseChannel);
	}

	static Specification<MatrixItem> byMacroProduct(MacroProduct macroProduct) {
		return (r, q, b) -> b.equal(r.get(MatrixItem_.product).get(Product_.macroProduct), macroProduct);
	}

	static Specification<MatrixItem> byCollateralFlg(boolean collateralFlg) {
		return (r, q, b) -> equalOrNull(b, r.get(MatrixItem_.hasCollateralFlg), collateralFlg);
	}


	static Specification<MatrixItem> byIdNotNull() {
		return (r, q, b) -> r.get(MatrixItem_.id).isNotNull();
	}


	//-------------------utility methods---------------//
	static Predicate betweenIncluding(Long val, CriteriaBuilder b, Path<Long> min, Path<Long> max) {
		return b.and(b.or(b.greaterThanOrEqualTo(min, val), min.isNull()),
				b.or(b.lessThanOrEqualTo(max, val), max.isNull())
		);
	}

	static Predicate betweenIncluding(Double val, CriteriaBuilder b, Path<Double> min, Path<Double> max) {
		return b.and(b.or(b.greaterThanOrEqualTo(min, val), min.isNull()),
				b.or(b.lessThanOrEqualTo(max, val), max.isNull())
		);
	}

	//comma separated list MUST has suffix and prifix commas, e.g. ',sd,as,' is valid, but 'sd,as' is not!
	static Predicate inCommaList(CriteriaBuilder b, Path<String> field, String val) {
		return b.like(field, "," + val + ",");
	}

	static Predicate inCommaListOrNull(CriteriaBuilder b, Path<String> field, String val) {
		return b.or(inCommaList(b, field, val), field.isNull());
	}

	static Predicate equalOrNull(CriteriaBuilder b, Path<Boolean> field, boolean val) {
		return b.or(b.equal(field, val), field.isNull());
	}


}
