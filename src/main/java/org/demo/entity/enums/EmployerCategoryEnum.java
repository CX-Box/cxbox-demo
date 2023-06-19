package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum EmployerCategoryEnum {
	RosBank("Банк"),
	VIP("Привилегированный Партнер"),
	SalaryProject("Зарплатный проект"),
	Partner("Партнер"),
	Budget("Бюджетная организация"),
	Other("Прочие (Улица)"),
	Military("Военные"),
	White_list("Белый список"),
	SalaryProject_White("Зарплатный проект (Белый список)"),
	Interros("Интеррос"),
	SalaryProject_Interros("Зарплатный проект (Интеррос)"),
	White_list_top("Белый список (Топ)"),
	SalaryProject_White_top("Зарплатный проект (Белый Топ)");

	@JsonValue
	private final String value;

	public static EmployerCategoryEnum getByValue(@NonNull String value) {
		return Arrays.stream(EmployerCategoryEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
