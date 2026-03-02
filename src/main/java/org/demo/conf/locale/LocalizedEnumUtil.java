package org.demo.conf.locale;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;
import org.springframework.context.i18n.LocaleContextHolder;

public final class LocalizedEnumUtil {

	private LocalizedEnumUtil() {
	}

	public static String toValue(LocalizedEnum e) {
		Locale locale = LocaleContextHolder.getLocale();
		return Locale.FRENCH.getLanguage().equals(locale.getLanguage())
				? e.getValueFr()
				: e.getValueEn();
	}

	public static <E extends Enum<E> & LocalizedEnum>
	Optional<E> fromValue(Class<E> enumClass, @NotNull String value) {
		Map<String, Enum<?>> map = new HashMap<>();
		for (E e : enumClass.getEnumConstants()) {
			map.put(e.getValueEn(), e);
			map.put(e.getValueFr(), e);
		}

		return Optional.ofNullable((E) map.get(value));
	}

}