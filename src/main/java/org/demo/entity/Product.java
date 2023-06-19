package org.demo.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import lombok.EqualsAndHashCode;
import org.cxbox.model.core.entity.BaseEntity;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Table;
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

@Entity
@Table(name = "PRODUCT")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class Product extends BaseEntity {

	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
	private List<MatrixItem> matrixItems = new ArrayList<>();

	@Enumerated(value = EnumType.STRING)
	@Column
	private CategoryGroupEnum categoryGroup;

	public void addMatrixItem(MatrixItem matrixItem) {
		matrixItems.add(matrixItem);
		matrixItem.setProduct(this);
	}

	public void removeMatrixItem(MatrixItem matrixItem) {
		matrixItems.remove(matrixItem);
		matrixItem.setProduct(null);
	}

	/*mapped*/
	private String shortName;

	/*mapped*/
	private String productCode;

	/*mapped*/
	private String fullName;

	/*mapped*/
	@Column
	private String siebelId;

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@Column
	private MacroProduct macroProduct;

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@Column
	private StatusEnum status;

	/*not available in integration*/
	@Column
	private LocalDateTime startDate;

	/*not available in integration*/
	@Column
	private LocalDateTime endDate;

	/*mapped*/
	@Column
	private Long version;

	/*mapped*/
	@Column
	private Boolean nonStandartFlag;

	/*mapped*/
	@Column
	private Boolean notDSA;

	/*not available in integration*/
	@Column
	private Boolean gBCCheckedFlg;

	/*mapped*/
	@Column
	private Long maxDeviateAmount;

	/*mapped*/
	@Column
	private String convertationCorrectionCodeBIS;

	/*mapped*/
	@Column
	private String riskGroupBIS;

	/*mapped*/
	@Column
	private String loanTypeBIS;

	/*mapped*/
	@Column
	private Long rMReviewDate;

	/*mapped*/
	@Column
	private RiskSegmentEnum riskSegment;

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@Column
	private PreapproveProductEnum preapproveProduct;

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@CollectionTable(name = "CURRENCY", joinColumns = @JoinColumn(name = "Product_ID"))
	@ElementCollection(targetClass = CurrencyEnum.class)
	@Column(name = "VALUE", nullable = false)
	private Set<CurrencyEnum> currency = new HashSet<>();

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@Column
	private CurrencyEnum defaultCurrency;

	/*not available in integration*/
	@Column
	private Long ratioLoanDepositTerm;

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@CollectionTable(name = "INCOME_CONFIRM_TYPE", joinColumns = @JoinColumn(name = "Product_ID"))
	@ElementCollection(targetClass = IncomeConfirmTypeEnum.class)
	@Column(name = "VALUE", nullable = false)
	private Set<IncomeConfirmTypeEnum> incomeConfirmType = new HashSet<>();

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@CollectionTable(name = "PLEDGE_TYPE", joinColumns = @JoinColumn(name = "Product_ID"))
	@ElementCollection(targetClass = PledgeTypeEnum.class)
	@Column(name = "VALUE", nullable = false)
	private Set<PledgeTypeEnum> pledgeType = new HashSet<>();

	/*mapped*/
	@Column
	private Long pledgeNumMax;

	/*mapped*/
	@Column
	private Long guarantorNumMax;

	/*mapped*/
	@Column
	private Long guarantorNumMin;

	/*mapped*/
	@Column
	private Long pledgeNumMin;

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@Column
	private CategoryGroupGeneralEnum categoryGroupGeneral;

	/*not available in integration*/
	@Enumerated(value = EnumType.STRING)
	@Column
	private GBCLimitOperationTypeEnum gBCLimitOperationType;

	/*mapped*/
	@Column
	private Long offerExpireDate;

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@Column
	private ExpireDateUnitEnum offerExpireDateUnit;

	/*mapped*/
	@Column
	private Long acceptExpireDate;

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@Column
	private ExpireDateUnitEnum acceptExpireDateUnit;

	/*mapped*/
	@Column
	private Long rBValidityPeriod;

	/*not available in integration*/
	@Column
	private Boolean spouseTotalIncomeFlg;

	/*mapped*/
	@Column
	private Boolean reducedPaymentFlg;

	/*not available in integration*/
	@Enumerated(value = EnumType.STRING)
	@Column
	private RBNamedCardIssueAvailabilityEnum rBNamedCardIssueAvailability;

	/*not available in integration*/
	@Column
	private Boolean vIPAvailableFlag;

	/*mapped*/
	@Column
	private Boolean instantCardIssueFlg;

	/*not available in integration*/
	@Column
	private Long annuityDeviationCrCur;

	/*not available in integration*/
	@Column
	private Long annuityDeviationPercent;

	/*mapped*/
	@Column
	private Boolean fixedPaymentDateFlag;

	@Enumerated(value = EnumType.STRING)
	@CollectionTable(name = "INSURANCE_TYPE_ADM", joinColumns = @JoinColumn(name = "Product_ID"))
	@ElementCollection(targetClass = InsuranceTypeAdmEnum.class)
	@Column(name = "VALUE", nullable = false)
	private Set<InsuranceTypeAdmEnum> insuranceTypeAdm = new HashSet<>();

}
