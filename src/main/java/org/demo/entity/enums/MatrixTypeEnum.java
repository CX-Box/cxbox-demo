package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum MatrixTypeEnum {
	EmployerDiscount("Дисконты по работодателю", "Employer Discount"),
	AdditionalServices("Доп.Услуги", "AdditionalServices"),
	InsuranceAvailability("Доступность для клиента", "Insurance Availability"),
	DependentInsurances("Зависимые страховые программы", "Dependent Insurances"),
	CardCommissions("Комиссии по карте", "CardCommissions"),
	MaxPSK("Максимальная ПСК", "MaxPSK"),
	TermRate("Матрица Срок-Ставка", "Term-Rate"),
	ErrorMatrix("Матрица ошибок", "ErrorMatrix"),
	SumBoundaries("Ограничения параметров", "SumBoundaries"),
	PF("ПФ", "PF"),
	BISParams("Параметры БИС", "BISParams"),
	Product("Подбор продукта", "Product"),
	CheckAttach("Проверка вложений ЮЛ", "CheckAttach"),
	Check("Проверки", "Check"),
	PDC("Проверки PDC", "PDC"),
	ProductDiscount("Продуктовые дисконты", "Product Discount"),
	Requirements("Требования к участникам", "Requirements"),
	Tariff("Ценовые параметры", "Tariff");

	@JsonValue
	private final String value;

	private final String siebelLic;

	public static MatrixTypeEnum getByValue(@NonNull String value) {
		return Arrays.stream(MatrixTypeEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
