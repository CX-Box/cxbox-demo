package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;

@Getter
@AllArgsConstructor
public enum MarketingSegment3Enum {
	NLT("DEFAULT_MKTG_SEGMENT3", "333"),
	MassAffluent("Mass Affluent", "Mass Affluent"),
	N2("2", "2"),
	N3("3", "3"),
	N4("4", "4"),
	N5("5", "5"),
	N6("6", "6"),
	N7("7", "7"),
	N8("8", "8"),
	N9("9", "9"),
	N10("10", "10"),
	N11("11", "11"),
	N12("12", "12"),
	N13("13", "13"),
	N14("14", "14"),
	N15("15", "15"),
	N16("16", "16"),
	N17("17", "17"),
	N18("18", "18"),
	N19("19", "19"),
	N20("20", "20"),
	N21("21", "21"),
	N22("22", "22"),
	N23("23", "23"),
	N24("24", "24"),
	N25("25", "25");

	@JsonValue
	private final String value;

	private final String siebelLIC;

	public static MarketingSegment3Enum getByValue(@NonNull String value) {
		return Arrays.stream(MarketingSegment3Enum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}

	public static MarketingSegment3Enum getBySiebelLIC(@NonNull String value) {
		return Arrays.stream(MarketingSegment3Enum.values())
				.filter(enm -> Objects.equals(enm.getSiebelLIC(), value))
				.findFirst()
				.orElse(null);
	}
}
