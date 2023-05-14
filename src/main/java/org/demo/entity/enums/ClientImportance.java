package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ClientImportance {
	HIGH("High", "#EC3F3F"),
	MIDDLE("Middle", "#FCA546"),
	LOW("Low", "#008C3E");

	@JsonValue
	private final String value;

	private final String color;
}
