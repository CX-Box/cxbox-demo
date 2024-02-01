package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum DocumentTypeEnum {
	ARG_CANCEL_REq("Заявление на расторжение договора"),
	PASS("Паспорт"),
	REG("Регистрация");

	@JsonValue
	private final String value;

	public static DocumentTypeEnum getByValue(@NonNull String value) {
		return Arrays.stream(DocumentTypeEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
