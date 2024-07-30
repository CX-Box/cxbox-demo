package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;

@Getter
@AllArgsConstructor
public enum Briefings {
	PROJECT_BRIEFING("Project Briefing"),
	SECURITY_BRIEFING("Security Briefing"),
	MARKET_BRIEFING("Market Briefing"),
	FINANCIAL_BRIEFING("Financial Briefing"),
	OPERATIONAL_BRIEFING("Operational Briefing");

	@JsonValue
	private final String value;

	public static Briefings getByValue(@NonNull String value) {
		return Arrays.stream(Briefings.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
