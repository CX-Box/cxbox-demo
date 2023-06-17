package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum MarketingSegment4Enum {
	ONE("Вкладчик Банка", "1"),
	TWO("РКО", "2"),
	THREE("Действующий депозит", "3"),
	NLT("(NLT) Маркетинговый сегмент 4 по умолчанию", "444");

	@JsonValue
	private final String value;

	private final String siebelLIC;

	public static MarketingSegment4Enum getByValue(@NonNull String value) {
		return Arrays.stream(MarketingSegment4Enum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}

	public static MarketingSegment4Enum getBySiebelLIC(@NonNull String value) {
		return Arrays.stream(MarketingSegment4Enum.values())
				.filter(enm -> Objects.equals(enm.getSiebelLIC(), value))
				.findFirst()
				.orElse(null);
	}
}
