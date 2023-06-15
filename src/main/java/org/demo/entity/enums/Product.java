package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Product {
	CREDIT_CARD("Кредитная карта"),
	OVERDRAFT("Овердрафт");

	@JsonValue
	private final String value;
}
