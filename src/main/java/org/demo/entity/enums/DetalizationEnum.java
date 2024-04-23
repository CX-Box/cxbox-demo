package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum DetalizationEnum {
	HIGH("High", "high detail"),
	MIDDLE("Middle", "medium detail"),
	LOW("Low", "low detail");

	@JsonValue
	private final String value;

	private final String promt;

	public static DetalizationEnum getByValue(@NonNull String value) {
		return Arrays.stream(DetalizationEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
