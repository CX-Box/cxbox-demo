package org.demo.entity.enums;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum DocumentStatus {

	SIGNED("Signed"),
	NOT_SIGNED("Not Signed");

	public static final Map<DocumentStatus, String> colors = Map.of(
			NOT_SIGNED, "#ec3f3f",
			SIGNED, "#008C3E"
	);

	@JsonValue
	private final String value;
}
