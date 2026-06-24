package org.demo.entity.enums;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum DocumentStatus {

	SIGNED("Signed","#008C3E"),
	NOT_SIGNED("Not Signed","#ec3f3f");

	@JsonValue
	private final String value;

	private final String color;
}
