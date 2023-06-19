package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum PledgeTypeEnum {
	BA("Автотранспортные средства", "BA"),
	Deposit("Вклад", "Deposit"),
	RealEstate("Недвижимость", "Real Estate"),
	U1("Недвижимость", "U1"),
	TS("ТС", "TS");

	@JsonValue
	private final String value;

	private final String siebelLIC;
	public static PledgeTypeEnum getByValue(@NonNull String value) {
		return Arrays.stream(PledgeTypeEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}

	public static PledgeTypeEnum getBySiebelLIC(@NonNull String value) {
		return Arrays.stream(PledgeTypeEnum.values())
				.filter(enm -> Objects.equals(enm.getSiebelLIC(), value))
				.findFirst()
				.orElse(null);
	}
}
