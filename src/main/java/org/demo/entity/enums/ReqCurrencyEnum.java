package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum ReqCurrencyEnum {
	RUB("RUB");

	@JsonValue
	private final String value;

	public static ReqCurrencyEnum getByValue(@NonNull String value) {
		return Arrays.stream(ReqCurrencyEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
