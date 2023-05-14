package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SaleStatus {
	OPEN("Open"),
	CLOSED("Closed");

	@JsonValue
	private final String value;
}
