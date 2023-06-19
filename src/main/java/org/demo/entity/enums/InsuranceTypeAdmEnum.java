package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum InsuranceTypeAdmEnum {
	DSAGO("ДСАГО", "DSAGO"),
	Kasko("Каско", "Kasko"),
	InsuranceLife("Страхование жизни", "Insurance Life"),
	InsuranceWork("Страхование от потери работы", "Insurance Work"),
	Returnonly("Вернуть просто", "Return only"),
	TaxService("Личный доктор Семейный", "Tax Service"),
	ComfortLine("Комфорт Лайн", "Comfort Line"),
	CriticalIllness("Cтрахование критич.заболеваний", "Critical Illness"),
	GOLD_TR("GOLD_TR", "GOLD_TR"),
	PLATINUM_TR("PLATINUM_TR", "PLATINUM_TR"),
	VIP_TR("VIP_TR", "VIP_TR"),
	GeneticPasport("Генетический паспорт", "Genetic Pasport"),
	MainEvent("Главное событие", "Main Event"),
	Revolving("Коллективное страхование жизни", "Revolving"),
	MultiPolicy("Комбинированное страхование рисков", "Multi Policy"),
	HealthMonitoring("Контроль здоровья", "Health Monitoring"),
	PersonalDoctor("Личный доктор", "Personal Doctor"),
	WorldOfHealth("Мир Здоровья", "WorldOfHealth"),
	MyRightDecision("Мое верное решение", "My Right Decision"),
	RsbBoxProperty("Мой надежный дом", "Rsb Box Property"),
	MyPeronalProtection("Моя Личная Защита", "My Peronal Protection"),
	MyMaximumProtection("Моя Максимальная Защита", "MyMaximumProtection"),
	MySecureCard("Моя защищенная карта", "My Secure Card"),
	EndowmentLifeInsurance("Накопительное страхование жизни", "Endowment Life Insurance"),
	Relax("Отдохни", "Relax"),
	RsbBoxPropertyOld("Погода в доме", "Rsb Box Property Old"),
	HelpNear("Помощь рядом", "Help Near"),
	InsuranceLife5Y("Страхование жизни(свыше 5 лет)", "Insurance Life 5Y"),
	RsbTravel("Страхование путешествующих", "Rsb Travel"),
	FinPillow("Финансовая подушка", "FinPillow"),
	ComplexMortgage("Комплекс. ип. cтрахование", "Complex Mortgage"),
	GAP("Погода в доме", "GAP,"),
	AutoCredit("Страхование жизни (автокред)", "AutoCredit"),
	InsuranceLifeMortgage("Страхование жизни (ипотека)", "Insurance Life Mortgage"),
	InsuranceConsumer("Страхование жизни (потреб)", "Insurance Consumer"),
	InsuranceLifeContributors("Страхование жизни вкладчиков", "Insurance Life Contributors"),
	InsuranceCard("Страхование карт", "Insurance Card"),
	AccidentInsurance("Страхование от несчаст.случаев", "Accident Insurance"),
	TitleInsuranceMortgage("Страхование титула (ипотека)", "Title Insurance Mortgage"),
	TitleInsurance("Страхование титула и имущества", "Title Insurance");

	@JsonValue
	private final String value;

	private final String siebelLIC;

	public static InsuranceTypeAdmEnum getByValue(@NonNull String value) {
		return Arrays.stream(InsuranceTypeAdmEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}

	public static InsuranceTypeAdmEnum getBySiebelLIC(@NonNull String value) {
		return Arrays.stream(InsuranceTypeAdmEnum.values())
				.filter(enm -> Objects.equals(enm.getSiebelLIC(), value))
				.findFirst()
				.orElse(null);
	}
}
