package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum TargetOpenSystemEnum {
	ART2("ART2"),
	ART("ART"),
	BIS("BIS");

	@JsonValue
	private final String value;

	public static TargetOpenSystemEnum getByValue(@NonNull String value) {
		return Arrays.stream(TargetOpenSystemEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
