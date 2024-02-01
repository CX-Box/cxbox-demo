package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum ProcessEnum {
	CURATOR_MISTAKE("Окончание в связи с ошибкой куратора"),
	CLIENT_MISTAKE("Окончание в связи с ошибкой клиента"),
	DONE_WITH_MONEY_BACK("Возврат премии при досрочном расторжении договора"),
	DONE_WITHOUT_MONEY_BACK("Реализация с возвратом ДС"),
	CANCEL("Отмена прекращения"),
	DONE("Реализация");

	@JsonValue
	private final String value;

	public static ProcessEnum getByValue(@NonNull String value) {
		return Arrays.stream(ProcessEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
