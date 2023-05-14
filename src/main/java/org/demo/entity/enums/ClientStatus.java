package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ClientStatus {
	NEW("New"),
	INACTIVE("Inactive"),
	IN_PROGRESS("In progress");

	@JsonValue
	private final String value;
}
