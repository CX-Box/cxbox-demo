package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum ParticipantTypesEnum {
	Borrower("Заемщик"),
	Pledgor("Созаемщик"),
	Guarantor("Поручитель"),
	Coborrower("Созаемщик");

	@JsonValue
	private final String value;

	public static ParticipantTypesEnum getByValue(@NonNull String value) {
		return Arrays.stream(ParticipantTypesEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
