package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;

@Getter
@AllArgsConstructor
public enum Documents {

	REFERENCE_DOCUMENT("Reference Document"),
	POLICY_DOCUMENT("Policy Document"),
	TECHNICAL_DOCUMENT("Technical Document"),
	LEGAL_DOCUMENT("Legal Document"),
	COMPLIANCE_DOCUMENT("Compliance Document");

	@JsonValue
	private final String value;

	public static Documents getByValue(@NonNull String value) {
		return Arrays.stream(Documents.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
