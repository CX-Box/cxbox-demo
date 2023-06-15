package org.demo.entity;

import lombok.EqualsAndHashCode;
import org.demo.entity.enums.CardCategoryEnum;
import org.demo.entity.enums.CollateralAvailabilityEnum;
import org.demo.entity.enums.PaymentDateEnum;
import org.demo.entity.enums.Product;
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
	private Product product;

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
	@Column
	private TypeCalcEnum typeCalc;

	@Column
	private Long reqAmount;

	@Column
	private Long reqPayment;

	@Column
	private Long reqTerm;

	@Enumerated(value = EnumType.STRING)
	@Column
	private ReqCurrencyEnum reqCurrency;

	@Enumerated(value = EnumType.STRING)
	@Column
	private PaymentDateEnum paymentDate;

	@Column
	private Boolean rBSelectDayFlag;

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

}
