package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum TypeEnum {
	PAY_REQ("Заявка на платеж"),
	AGREEMENT_CHANGE("Изменение условий договора"),
	OPERATION("Операционная заявка"),
	AGREEMENT_STOP("Прекращение договора"),
	DOCS_REVIEW("уточнение недостающих документов");

	@JsonValue
	private final String value;

	public static TypeEnum getByValue(@NonNull String value) {
		return Arrays.stream(TypeEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
