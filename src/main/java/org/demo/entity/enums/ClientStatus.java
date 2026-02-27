package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;
import java.util.Locale;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.context.i18n.LocaleContextHolder;

@Getter
@AllArgsConstructor
public enum ClientStatus {
	NEW_FR("Nouvelle",Locale.FRENCH.getLanguage()),
	NEW("New",Locale.ENGLISH.getLanguage()),

	INACTIVE_FR("Inactive", Locale.FRENCH.getLanguage()),
	INACTIVE("Inactive", Locale.ENGLISH.getLanguage()),

	IN_PROGRESS_FR("En cours",Locale.FRENCH.getLanguage()),
	IN_PROGRESS("In progress",Locale.ENGLISH.getLanguage());

	@JsonValue
	private final String value;

	private final String locale;

	public static ClientStatus  getValueWithLocale(ClientStatus value) {
		return Arrays.stream(values())
				.filter(e ->
						e.name().equals(value.name())
								&& e.locale.equals(LocaleContextHolder.getLocale().getLanguage())
				)
				.findFirst()
				.orElse(value);
	}
	public static ClientStatus[] valuesWithLocale() {
		return Arrays.stream(values())
				.filter(e ->
						e.locale.equals(LocaleContextHolder.getLocale().getLanguage())
				)
				.toArray(ClientStatus[]::new);
	}

}
