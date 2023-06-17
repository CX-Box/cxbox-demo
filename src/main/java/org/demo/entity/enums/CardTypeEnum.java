package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum CardTypeEnum {
	NamedCard("Именная", "Named Card"),
	UnembossedCard("Неименная", "Unembossed Card");

	@JsonValue
	private final String value;

	private final String siebelLIC;

	public static CardTypeEnum getBySiebelLIC(@NonNull String value) {
		return Arrays.stream(CardTypeEnum.values())
				.filter(enm -> Objects.equals(enm.getSiebelLIC(), value))
				.findFirst()
				.orElse(null);
	}

	public static CardTypeEnum getByValue(@NonNull String value) {
		return Arrays.stream(CardTypeEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
