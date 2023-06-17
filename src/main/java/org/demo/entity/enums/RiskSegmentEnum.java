package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum RiskSegmentEnum {
	R0("R0"),
	R1("R1"),
	R2("R2"),
	R3("R3"),
	R4("R4"),
	R5("R5"),
	R6("R6"),
	R7("R7"),
	R8("R8"),
	R9("R9");

	@JsonValue
	private final String value;

	public static RiskSegmentEnum getByValue(@NonNull String value) {
		return Arrays.stream(RiskSegmentEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
