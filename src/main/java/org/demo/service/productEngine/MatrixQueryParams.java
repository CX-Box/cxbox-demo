package org.demo.service.productEngine;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
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

//service:ATC Product Manipulation
@Getter
@Setter
public class MatrixQueryParams {

	private MatrixTypeEnum matrixTypeEnum;

	//InitParticipantMatrixQueryParams
	private YesNoEnum salaryClient; //+bc calc -> SetProperty("Salary Client",bcContact.FirstRecord() && bcContact.GetFieldValue("ATC Salary Client")!="" ? bcContact.GetFieldValue("ATC Salary Client") : bcCalc.GetFieldValue("Default Salary Client Calc")); //зарплатный клиент

	private MarketingSegment1Enum marketingSegment1; //+bcContact.GetFieldValue("ATC Segment 1")!="" ? bcContact.GetFieldValue("ATC Segment 1") : bcCalc.GetFieldValue("Default Marketing Segment 1 Calc")); //маркетинговый сегмент 1 or bcCalc.GetFieldValue("Default Marketing Segment 1 Calc")

	private MarketingSegment2Enum marketingSegment2; //+bcContact.GetFieldValue("ATC Segment 2")!="" ? bcContact.GetFieldValue("ATC Segment 2") : bcCalc.GetFieldValue("Default Marketing Segment 2 Calc")); //маркетинговый сегмент 2 or bcCalc.GetFieldValue("Default Marketing Segment 2 Calc")

	private MarketingSegment3Enum marketingSegment3; //+bcContact.GetFieldValue("ATC Segment 3")!="" ? bcContact.GetFieldValue("ATC Segment 3") : bcCalc.GetFieldValue("Default Marketing Segment 3 Calc")); //маркетинговый сегмент 3 or bcCalc.GetFieldValue("Default Marketing Segment 3 Calc")

	private MarketingSegment4Enum marketingSegment4; //+bcContact.GetFieldValue("ATC Segment 4")!="" ? bcContact.GetFieldValue("ATC Segment 4") : bcCalc.GetFieldValue("Default Marketing Segment 4 Calc")); //маркетинговый сегмент 4 or bcCalc.GetFieldValue("Default Marketing Segment 4 Calc"

	private EmployerCategoryEnum employerCategory; //+employerCategory!="" ? employerCategory : bcCalc.GetFieldValue("Default Employee Category Calc")); //категория работодателя where employerCategory c bcContact->bcEmployment->boEmployer(INN)->bcEmployer.GetFieldValue("Category")

	//TariffCode on Product Item Matrix
	private String marketingSelectNum; //+bcContact.FirstRecord()? bcContact.GetFieldValue("ATC Marketing Selection Number") : ""); //код маркетинговой выборки (промо) !!!!!!!!! AND THEN !!!!!!!!! //bcCalc.GetFieldValue("Marketing Selection Num") > "" ? bcCalc.GetFieldValue("Marketing Selection Num") : bcCalc.GetFieldValue("Vector Tariff Code") ); //BSGV-10601>>TKUZNETSOVA>>16.05.2018>>Код тарифа (промо)

	private IncomeConfirmTypeEnum incomeConfirmDocumentType; //+or optyConId -> bcOptyEmployment(primary) -> bcOptyConIncome.GetFieldValue("Confirm Type")

	//InitMatrixQueryParams
	private String sCalcOrgId; //? bcCalc.GetFieldValue("Primary Organization Id") --> Expr: 'IIf(GetProfileAttr("Primary Position Type")=LookupValue("POSITION_TYPE","Central Unit Manager"),"",GetProfileAttr("ATC Primary Organization Id"))'

	private String sOptyOrgId; //? bcOpty.GetFieldValue("Primary Organization Id");

	private MacroProduct macroproduct; //+bcCalc.GetFieldValue("Macroproduct")

	private String productCode; //+bcCalc.GetFieldValue("Req Product Code")

	private Boolean hasCollateralFlg; //+bcCalc.GetFieldValue("Collateral Flag")=="Y"

	private Long term; //+bcCalc.GetFieldValue("Req Term")

	private Double amount; //+bcCalc.GetFieldValue("Req Amount")

	private ReqCurrencyEnum currency; //+bcCalc.GetFieldValue("Req Currency")

	private String insuranceType; //+bcCalc -> bcCalcIns.SetSearchSpec("Selected Flag", "Y"); -> bcCalcIns.GetFieldValue("Insurance Type")

	private CardCategoryEnum cardCategory; //+bcCalc.GetFieldValue("Card Category")

	private CardTypeEnum cardType; //+ bcCalc.GetFieldValue("Card Type")); //тип карты

	private RiskSegmentEnum riskSegment; //+bcCalc.GetFieldValue("Vector Risk Segment")!="" ? bcCalc.GetFieldValue("Vector Risk Segment") : bcCalc.GetFieldValue("Product Risk Segment")); //риск-сегмент

	private String attractionCloseChannel; //+bcCalc.GetFieldValue("ZV Attraction Channel")); //BSGV-9372>>TKUZNETSOVA>>Канал привлечения клиента

	private Long productId; //+с bcOpty если есть, иначе с  bcCalc.GetFieldValue("Req Product Id");
}
