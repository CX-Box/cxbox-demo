package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum GBCLoanCategoryEnum {
	C1M("1M"),
	C3L("3L"),
	C3N("3N");

	@JsonValue
	private final String value;

	public static GBCLoanCategoryEnum getByValue(@NonNull String value) {
		return Arrays.stream(GBCLoanCategoryEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
