package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

//LOV:ATC_TYPE_CALC
@Getter
@AllArgsConstructor
public enum TypeCalcEnum {
	AmountTerm("От суммы и срока"),
	PaymentTerm("От платежа и срока");

	@JsonValue
	private final String value;

	public static TypeCalcEnum getByValue(@NonNull String value) {
		return Arrays.stream(TypeCalcEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
