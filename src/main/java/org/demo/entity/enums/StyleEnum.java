package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum StyleEnum {
	AV_1("Азбука - реалистичный", "Scandinavian style, abstraction, realistic, pattern"),
	AV_2("Азбука - обычный", "Scandinavian style, abstraction, retail, pattern");

	@JsonValue
	private final String value;

	private final String promt;

	public static StyleEnum getByValue(@NonNull String value) {
		return Arrays.stream(StyleEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
