package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum AttractionCloseChannelEnum {
	DSA("DSA"),
	WS("Веб сайт"),
	Branch("Доп.офис Банка"),
	DS("ИнтернетБанк"),
	CC("Контакт-центр");

	@JsonValue
	private final String value;

	public static AttractionCloseChannelEnum getByValue(@NonNull String value) {
		return Arrays.stream(AttractionCloseChannelEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
