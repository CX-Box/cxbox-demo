package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum CardCategoryEnum {
	VISA_CLASSIC("Visa Classic"),
	MIR_SUPREME("МИР Supreme");

	@JsonValue
	private final String value;

	public static CardCategoryEnum getByValue(@NonNull String value) {
		return Arrays.stream(CardCategoryEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
