package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum ATCScheduleTypeEnum {
	A("A"),
	B("B"),
	C("C");

	@JsonValue
	private final String value;

	public static ATCScheduleTypeEnum getByValue(@NonNull String value) {
		return Arrays.stream(ATCScheduleTypeEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
