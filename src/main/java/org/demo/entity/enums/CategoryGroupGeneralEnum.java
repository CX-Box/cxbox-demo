package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum CategoryGroupGeneralEnum {
	Bad("Bad"),
	Good("Good"),
	Standart("Standart");

	@JsonValue
	private final String value;

	public static CategoryGroupGeneralEnum getByValue(@NonNull String value) {
		return Arrays.stream(CategoryGroupGeneralEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
