package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum TargetNodeType {
	MAIN("main");

	@JsonValue
	private final String value;

}
