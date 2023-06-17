package org.demo.entity;

import lombok.EqualsAndHashCode;
import org.demo.entity.enums.CardCategoryEnum;
import org.demo.entity.enums.CollateralAvailabilityEnum;
import org.demo.entity.enums.MacroProduct;
import org.demo.entity.enums.PaymentDateEnum;
import org.demo.entity.enums.ReqCurrencyEnum;
import org.demo.entity.enums.SaleStatus;
import org.cxbox.model.core.entity.BaseEntity;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.demo.entity.enums.TypeCalcEnum;

@Entity
@Table(name = "SALE")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class Sale extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "CLIENT_ID")
	private Client client;

	@Column
	@Enumerated(EnumType.STRING)
	private MacroProduct macroproduct;

	@Column
	@Enumerated(EnumType.STRING)
	private SaleStatus status;


	private Long sum;


	@Enumerated(value = EnumType.STRING)
	@Column
	private CollateralAvailabilityEnum collateralAvailability;

	@Enumerated(value = EnumType.STRING)
	@Column
	private CardCategoryEnum cardCategory;

	//TODO>>join Tariff
	@Column
	private Long tariffMinMonthPayment;

	//TODO>>join Card Commission
	@Column
	private Long cardCommissionThirdYear;

	@Column
	private String hintTest;

	@Column
	private String cardHint;


	@Enumerated(value = EnumType.STRING)
	@Column(columnDefinition = "varchar(100) default 'AmountTerm'")
	private TypeCalcEnum typeCalc = TypeCalcEnum.AmountTerm;

	@Column
	private Double reqAmount;

	@Column
	private Double reqPayment;

	@Column
	private Long reqTerm;

	@Enumerated(value = EnumType.STRING)
	@Column
	private ReqCurrencyEnum reqCurrency;

	@Enumerated(value = EnumType.STRING)
	@Column
	private PaymentDateEnum paymentDate;

	@Column
	private Boolean selDayFlg;

	@Column
	private Boolean customRateFlg;

	@Column
	private Long reqRate;

	@Column
	private Boolean reducedPaymentFlag;

	@Column
	private Long reducedPayment;

	@Column
	private Long reducedPaymentTerm;

	@Column
	private Long amountHandWithoutInsurance;

	@Column
	private Long overpaymentAmountDay;

	@Column
	private Long overpaymentAmount;

	@Column
	private Long overpaymentAmountPercent;

	@Column
	private Long pSKPercent;

	@Column
	private Long approvedAmount;

	@Column
	private Long resAmount;

	@Column
	private Long pSKPercentCrics;

	@Column
	private Long sumCreditAdditionalServices;

	@JoinColumn(name = "REQ_PRODUCT_ID")
	@ManyToOne
	private Product reqProduct;

}
