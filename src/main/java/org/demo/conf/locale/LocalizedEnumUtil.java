package org.demo.conf.locale;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.jetbrains.annotations.NotNull;
import org.springframework.context.i18n.LocaleContextHolder;

public final class LocalizedEnumUtil {

	private LocalizedEnumUtil() {
	}

	private static final Map<Class<?>, Map<String, Enum<?>>> CACHE = new ConcurrentHashMap<>();

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