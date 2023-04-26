package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ClientImportance {
	High("High", "#EC3F3F"),
	Middle("Middle", "#FCA546"),
	Low("Low", "#008C3E");

	@JsonValue
	private final String value;

	private final String color;
}
