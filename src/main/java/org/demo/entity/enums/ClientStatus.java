package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;
import java.util.stream.Stream;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.i18n.LocaleContextHolder;

@Slf4j
@Getter
@AllArgsConstructor
public enum ClientStatus {
	NEW("New","Nouvelle"),
	INACTIVE("Inactive","Inactive"),
	IN_PROGRESS("In progress","En cours");

	@JsonValue
	private final String value;

	private final String valueFr;

	@JsonValue
	public String toValue() {
		if (Locale.FRENCH.getLanguage().equals(LocaleContextHolder.getLocale().getLanguage())) {
			return valueFr;
		}
		return value;
	}

	@JsonCreator
	public static ClientStatus fromValue(String value) {
		return Stream.of(values())
				.filter(s -> s.toValue().equalsIgnoreCase(value))
				.findFirst()
				.orElseGet(() -> {
					log.warn("Unknown SaleStatus: {}", value);
					return null;
				});
	}
}
