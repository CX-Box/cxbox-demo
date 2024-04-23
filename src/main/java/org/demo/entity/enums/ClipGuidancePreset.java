package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ClipGuidancePreset {
	NO("Без фильтров"),
	FAST_BLUE("FAST_BLUE"),
	FAST_GREEN("FAST_GREEN"),
	SIMPLE("SIMPLE"),
	SLOW("SLOW"),
	SLOWER("SLOWER"),
	SLOWEST("SLOWEST");

	@JsonValue
	private final String value;
}
