package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum CollateralAvailabilityEnum {
	NO_PLEDGE("Нет"),
	PLEDGE("Предоставлено"),
	RB_SUBSEQUENT_PLEDGE("Постзалог");

	@JsonValue
	private final String value;

	public static CollateralAvailabilityEnum getByValue(@NonNull String value) {
		return Arrays.stream(CollateralAvailabilityEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
