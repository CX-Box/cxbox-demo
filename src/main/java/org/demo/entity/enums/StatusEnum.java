package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum StatusEnum {
	Active("Активный"),
	Inactive("Не действует"),
	InProgress("Редактируется");

	@JsonValue
	private final String value;

	public static StatusEnum getByValue(@NonNull String value) {
		return Arrays.stream(StatusEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
