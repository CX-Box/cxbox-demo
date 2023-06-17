package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum MarketingSegment1Enum {
	NLT("Маркетинговый сегмент по умолчанию", "111"),
	ONE("1", "1"),
	Affluent("Affluent", "Affluent"),
	TopAffluent("Top Affluent", "Top Affluent"),
	VIP1("VIP 1", "VIP 1"),
	VIP2("VIP 2", "VIP 2"),
	Mass("Mass", "Mass"),
	HNWI("HNWI", "HNWI");

	@JsonValue
	private final String value;

	private final String siebelLIC;

	public static MarketingSegment1Enum getByValue(@NonNull String value) {
		return Arrays.stream(MarketingSegment1Enum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}

	public static MarketingSegment1Enum getBySiebelLIC(@NonNull String value) {
		return Arrays.stream(MarketingSegment1Enum.values())
				.filter(enm -> Objects.equals(enm.getSiebelLIC(), value))
				.findFirst()
				.orElse(null);
	}
}
