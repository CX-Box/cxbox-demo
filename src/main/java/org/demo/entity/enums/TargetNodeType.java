package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum TargetNodeType {
	MAIN("main");

	@JsonValue
	private final String value;

	private static final Map<String, TargetNodeType> BY_VALUE =
			Arrays.stream(values()).collect(Collectors.toMap(TargetNodeType::getValue, Function.identity()));

	public static TargetNodeType fromValue(String value) {
		if (value == null) {
			return null;
		}
		TargetNodeType t = BY_VALUE.get(value);
		if (t == null) {
			throw new IllegalArgumentException("Unknown TargetNodeType value: " + value);
		}
		return t;
	}
}
