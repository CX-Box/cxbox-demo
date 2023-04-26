package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Product {
	Equipment("Equipment"),
	Expertise("Expertise");

	@JsonValue
	private final String value;
}
