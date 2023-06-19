package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum YesNoEnum {
	YES("Да", true),
	NO("Нет", false);

	@JsonValue
	private final String value;

	private final boolean bolValue;
	public static YesNoEnum getByValue(@NonNull String value) {
		return Arrays.stream(YesNoEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
