package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

/*siebel lov ATC_CARD_CATEGORY*/
@Getter
@AllArgsConstructor
public enum CardCategoryEnum {
	VisaRewardspayWave("Visa Rewards payWave", "Visa Rewards payWave", "Named Card"),
	MIRSupreme("МИР Supreme", "МИР Supreme", "Named Card"),
	MIRSupremePremium("МИР Supreme Премиальная", "МИР Supreme Премиальная", "Named Card"),
	MIRSupremePremiumOnline("МИР Supreme Премиальная Онлайн", "МИР Supreme Премиальная Онлайн", "Named Card"),
	VisaGold("Visa Gold", "Visa Gold", "Named Card"),
	VisaPlatinum("Visa Platinum", "Visa Platinum", "Named Card"),
	VisaClassicTravelMiles("Visa Classic Travel Miles", "Visa Classic Travel Miles", "Named Card"),
	VisaSignature("Visa Signature", "Visa Signature", "Named Card"),
	VisaGoldTravelMiles("Visa Gold Travel Miles", "Visa Gold Travel Miles", "Named Card"),
	VisaPlatinumTravelMiles("Visa Platinum Travel Miles", "Visa Platinum Travel Miles", "Named Card"),
	MasterCardStandard("MC Standard", "MasterCard Standard", "Named Card"),
	MCGold("MC Gold", "MC Gold", "Named Card"),
	MasterCardPlatinum("MC Platinum", "MasterCard Platinum", "Named Card"),
	MasterCardWorldBlack("MasterCard World Black", "MasterCard World Black", "Named Card"),
	MasterCardWorldTravelMiles("MC World Travel Miles", "MasterCard World Travel Miles", "Named Card"),
	MasterCardWorldPremiumee("MasterCard World Premiumee", "MasterCard World Premiumee", "Named Card"),
	MCUnembossedALL("MC (неименная) #МожноВСЁ", "MC (неименная) #МожноВСЁ", null),
	MasterCardWorldPremium("MC World Premium", "MasterCard World Premium", "Named Card"),
	MCWorldPremTravelMiles("MC World Premium Trmil", "MC World Prem Travel Miles", "Named Card"),
	MasterCardWorldPremiumRZD("MC World Premium РЖД", "MasterCard World Premium РЖД", "Named Card"),
	VisaUnembossedAll("Visa (неименная) #МожноВСЁ", "Visa (неименная) #МожноВСЁ", null),
	MIRUnembossedAll("МИР (неименная) #МожноВСЁ", "МИР (неименная) #МожноВСЁ", null),
	VisaClassicUnembossed("Visa Classic Unembossed", "Visa Classic Unembossed", "Unembossed Card"),
	VisaPlatinumAutoCard("Visa Platinum Автокарта", "Visa Platinum Автокарта", "Named Card"),
	VisaPlatinumOverCard("Visa Platinum Сверхкарта+", "Visa Platinum Сверхкарта+", "Named Card"),
	MCPlatinumClassic("MC Platinum Классическая", "MC Platinum Классическая", "Named Card"),
	VisaPlatinumClassic("Visa Platinum Классическая", "Visa Platinum Классическая", "Named Card"),
	VisaClassicUnembossed2("Visa Classic Неименная", "Visa Classic Неименная", "Unembossed Card"),
	VisaClassicCash("Visa Classic Наличная", "Visa Classic Наличная", "Named Card"),
	MCStandardCash("MC Standard Наличная", "MC Standard Наличная", "Named Card"),
	MCBlackEditionPremium("MC Black Edition Премиальная", "MC Black Edition Премиальная", "Named Card"),
	MasterCardWorld("MC World", "MasterCard World", "Named Card"),
	MasterCardWorldOK("MC World О`КЕЙ", "MasterCard World О`КЕЙ", "Named Card"),
	VisaSignaturePremium("Visa Signature Премиальная", "Visa Signature Премиальная", "Named Card"),
	VisaRewardsPayWave("МожноВСЁ", "VisaRewardsPayWave", "Named Card"),
	VisaSignaturePayWave("МожноВСЁ Премиальная", "VisaSignaturePayWave", "Named Card"),
	MCBlackEditionContactless("Премиальная кредитная карта", "MCBlackEditionContactless", "Named Card"),
	MasterCardWorld120Days("120подНОЛЬ", "MasterCard World 120 дней", "Named Card"),
	MCWorld120Zero("120подНоль", "MC World 120подНОЛЬ", "Named Card"),
	VisaInfinite("Visa Infinite", "Visa Infinite", "Named Card"),
	Zero120Premium("120подНОЛЬ Премиальная", "120подНОЛЬ Премиальная", "Named Card"),
	MasterCardALL("MasterCard #МожноВСЁ", "MasterCard #МожноВСЁ", null),
	MCBlackEditionALL("MC Black Edition #МожноВСЁ", "MC Black Edition #МожноВСЁ", null),
	MCBlackEdition("MC Black Edition", "MC Black Edition", null),
	VisaALL("Visa #МожноВСЁ", "Visa #МожноВСЁ", null),
	VisaSignatureALL("Visa Signature #МожноВСЁ", "Visa Signature #МожноВСЁ", null),
	MIRClassicUnembossed2("МИР Классическая (неименная)", "МИР Классическая (неименная)", null),
	MIRAdvanced("МИР Продвинутая", "МИР Продвинутая", null),
	MasterCardWorldRZD("MasterCard World РЖД", "MasterCard World РЖД", null),
	VisaPremiumOnline("Visa Премиальный Online", "Visa Премиальный Online", null),
	VisaPremium("Visa Премиальный", "Visa Премиальный", null),
	MastercardPremium("Mastercard Премиальный", "Mastercard Премиальный", null),
	MastercardPremiumOnline("Mastercard Премиальный Online", "Mastercard Премиальный Online", null),
	MIRClassicUnembossedCash("Мир Классич (неименная)_кэш", "Мир Классич (неименная)_кэш", null),
	MIRClassicUnembossedATMFree("МИР Классич (неимен) ATM Free", "МИР Классич (неимен) ATM Free", null),
	VisaClassic("Visa Classic", "Visa Classic", null),
	VisaGoldNoParent("Visa Gold", "Visa Gold", null),
	VisaPlatinumNoParent("Visa Platinum", "Visa Platinum", null),
	VisaSignatureNoParent("Visa Signature", "Visa Signature", null),
	MasterCardStandardNoParent("MC Standard", "MasterCard Standard", null),
	MCGoldNoParent("MC Gold", "MC Gold", null),
	MasterCardPlatinumNoParent("MC Platinum", "MasterCard Platinum", null);


	@JsonValue
	private final String value;

	private final String siebelLIC;

	private final String parent;

	public static CardCategoryEnum getByValue(@NonNull String value) {
		return Arrays.stream(CardCategoryEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
