package org.demo.entity;

import java.time.LocalDateTime;
import java.util.Set;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.entity.enums.ATCScheduleTypeEnum;
import org.demo.entity.enums.CategoryGroupGeneralEnum;
import org.demo.entity.enums.CurrencyEnum;
import org.demo.entity.enums.CurrencyEnum;
import org.demo.entity.enums.ExpireDateUnitEnum;
import org.demo.entity.enums.GBCLimitOperationTypeEnum;
import org.demo.entity.enums.IncomeConfirmTypeEnum;
import org.demo.entity.enums.InsuranceTypeAdmEnum;
import org.demo.entity.enums.MacroProduct;
import org.demo.entity.enums.MatrixTypeEnum;
import org.demo.entity.enums.PledgeTypeEnum;
import org.demo.entity.enums.PreapproveProductEnum;
import org.demo.entity.enums.RBNamedCardIssueAvailabilityEnum;
import org.demo.entity.enums.StatusEnum;
import org.demo.entity.enums.TargetOpenSystemEnum;

@Entity
@Table(name = "MATRIX_ITEM")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class MatrixItem extends BaseEntity {

	/*mapped*/
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PRODUCT_ID")
	private Product product;

	/*mapped*/
	@Column
	private String siebelId;

	/*mapped*/
	@Column
	private Long priority;

	/*mapped*/
	@Column
	private String currency;

	/*mapped*/
	@Column
	private String participantTypes;

	/*mapped*/
	@Column
	private String attractionCloseChannel;

	/*not available in integration*/
	@Column
	private String tariffCode;

	/*mapped*/
	@Column
	private String employerCategory;

	/*mapped*/
	@Column
	private String riskSegment;

	/*mapped*/
	@Column
	private String categoryGroupGeneral;

	/*mapped*/
	@Column
	private String categoryGroup;

	/*mapped*/
	@Column
	private String salaryClient;

	/*mapped*/
	@Column
	private String marketingSegment1;

	/*mapped*/
	@Column
	private String marketingSegment2;

	/*mapped*/
	@Column
	private String marketingSegment3;

	/*mapped*/
	@Column
	private String marketingSegment4;

	/*mapped*/
	@Column
	private String incomeConfirmDocumentType;

	/*mapped*/
	@Column
	private String insuranceType;

	/*mapped*/
	@Column
	private String rBSubsequentPledgeFlag;

	/*mapped*/
	@Column
	private Boolean hasCollateralFlg;

	/*mapped*/
	@Column
	private String cardType;

	/*mapped*/
	@Column
	private String cardCategory;

	/*mapped*/
	@Column
	private Long minTermMonths;

	/*mapped*/
	@Column
	private Long maxTermMonths;

	/*mapped*/
	@Column
	private Double minSum;

	/*mapped*/
	@Column
	private Double maxSum;

	/*not available in integration*/
	@Column
	private String gBCLoanCategory;

	/*mapped*/
	@Column
	private String proofOfIncome;

	/*mapped*/
	@Column
	private String tariffVersionPF;

	/*mapped*/
	@Column
	private String tariffNamePf;

	/*mapped*/
	@Column
	private String dismissTariffNamePf;

	/*mapped*/
	@Column
	private Double ratePercent;

	/*mapped*/
	@Column
	private Double cashCreditRate;

	/*mapped*/
	@Column
	private Double specCondRate;

	/*mapped*/
	@Column
	private Double minPercentRate;

	/*mapped*/
	@Column
	private Double minMonthlyPaymentForMainDebt;

	/*mapped*/
	@Column
	private Double minMounthPayment;

	/*mapped*/
	@Column
	private Double cashCommissionOverdraft;

	/*mapped*/
	@Column
	private String penaltiesForPaymDelayPf;

	/*mapped*/
	@Column
	private String penaltiesForNoCascoPf;

	/*mapped*/
	@Column
	private String paymentScheme;

	/*mapped*/
	@Column
	private Long gracePeriodMonth;

	/*not available in integration*/
	@Column
	private Long maxDelayTerm;

	/*not available in integration*/
	@Column
	private Long minDelayTerm;

	/*not available in integration*/
	@Column
	private Long delayToLoanTerm;

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@Column
	private ATCScheduleTypeEnum aTCScheduleType;

	/*mapped*/
	@Column
	private Boolean movePaymentDateFlg;

	/*mapped*/
	@Column
	private Double cardIssueCommission;

	/*mapped*/
	@Column
	private Double instantCardCommission;

	/*mapped*/
	@Column
	private Double onetimeCardCommission;

	/*mapped*/
	@Column
	private Double minCardServiceCommission;

	/*mapped*/
	@Column
	private Double maxCardServiceCommission;

	/*mapped*/
	@Column
	private Double fstYrCardCommission;

	/*mapped*/
	@Column
	private Double secondYrCardCommission;

	/*mapped*/
	@Column
	private Double thirdYrCard;

	/*mapped*/
	@Column
	private String fstYrCardCommissionPF;

	/*mapped*/
	@Column
	private String secondYrCardCommissionPF;

	/*mapped*/
	@Column
	private String thirdYrCardCommissionPF;

	/*mapped*/
	@Column
	private String cashCommission;

	/*mapped*/
	@Column
	private String othbankMoneyComission;

	/*mapped*/
	@Column
	private String bISCardProductCode;

	/*mapped*/
	@Column
	private String binRange;

	/*mapped*/
	@Column
	private String cardTariffCode;

	/*mapped*/
	@Column
	private Double limitOperationSum;

	/*mapped*/
	@Column
	private String aRTProductCode;

	/*not available in integration*/
	@Column
	private Double maxPDN;

	/*not available in integration*/
	@Column
	private Double minPDN;

	/*mapped*/
	@Column
	private String bISLoanCategory;

	/*mapped*/
	@Enumerated(value = EnumType.STRING)
	@Column
	private TargetOpenSystemEnum targetOpenSystem;

	/*mapped*/
	@Column
	private Boolean rfResidentRequired;

	/*mapped*/
	@Column
	private Boolean bankDivnJobAddress;

	/*mapped*/
	@Column
	private Boolean bankDivnResidency;

	/*mapped*/
	@Column
	private Boolean additionalIDRequired;

	/*mapped*/
	@Column
	private Boolean jobRequired;

	/*mapped*/
	@Column
	private Boolean confirmMarriageReq;

	/*mapped*/
	@Column
	private Double minTotalIncome;

	/*mapped*/
	@Column
	private Long minMthsAtJobReg;

	/*mapped*/
	@Column
	private Long minMthsAtJobNoreg;

	/*mapped*/
	@Column
	private Long minAgeForMen;

	/*mapped*/
	@Column
	private Long maxAgeForMenApplication;

	/*mapped*/
	@Column
	private Long maxAgeForMenPaid;

	/*mapped*/
	@Column
	private Long minAgeForWomen;

	/*mapped*/
	@Column
	private Long maxAgeForWomenApplication;

	/*mapped*/
	@Column
	private Long maxAgeForWomenPaid;

	/*mapped*/
	@Column
	private String bisClientCategory;

	/*mapped*/
	@Column
	private Double maxPSKPerc;

	/*mapped*/
	@Column
	private Double minLoanSumRestriction;

	/*mapped*/
	@Column
	private Double maxLoanSumRestriction;

	/*mapped*/
	@Column
	private Double minDepositSumRestriction;

	/*mapped*/
	@Column
	private Double maxDepositSumRestriction;

	/*mapped*/
	@Column
	private Long minTermRestriction;

	/*mapped*/
	@Column
	private Long maxTermRestriction;

	/*mapped*/
	@Column
	private Double refSumLoanRatio;

	/*mapped*/
	@Column
	private Long maxAddSum;

	/*mapped*/
	@Column
	private Long minAddSum;

	/*mapped*/
	@Column
	private Long minRefinSum;

	/*mapped*/
	@Column
	private Long maxRefinSum;

	/*mapped*/
	@Column
	private Double maxDeviateAmount;

	/*mapped*/
	@Column
	private Double creditTermPSK;

	/*mapped*/
	@Column
	private String errorCode;

	/*mapped*/
	@Column
	private String errorText;

	/*mapped*/
	@Column
	private Double bankRate;

	/*mapped*/
	@Column
	private Double specialRateDiscount;

	/*mapped*/
	@Column
	private Boolean preDisbursementCheckFlag;

	/*mapped*/
	@Column
	private Boolean electronicCheck;

	/*mapped*/
	@Column
	private Boolean preOfferCheck;

	/*mapped*/
	@Column
	private Boolean digitalProfileConsent;

	@Enumerated(value = EnumType.STRING)
	@Column
	private MatrixTypeEnum matrixType;

}
