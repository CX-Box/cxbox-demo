package org.demo.entity.enums;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum DocumentStatus {

	NEW("New"),
	ENCRYPTED_SIGNED("Encrypted and Signed");

	public static final Map<DocumentStatus, String> colors = Map.of(
			NEW, "#ec3f3f",
			ENCRYPTED_SIGNED, "#008c3e33"
	);

	@JsonValue
	private final String value;
}
