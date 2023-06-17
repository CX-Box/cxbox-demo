package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum ExpireDateUnitEnum {
	Calendar("Календарных"),
	Work("Рабочих");

	@JsonValue
	private final String value;

	public static ExpireDateUnitEnum getByValue(@NonNull String value) {
		return Arrays.stream(ExpireDateUnitEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
