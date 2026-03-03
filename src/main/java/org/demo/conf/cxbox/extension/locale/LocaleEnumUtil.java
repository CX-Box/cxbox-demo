package org.demo.conf.cxbox.extension.locale;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import lombok.NonNull;
import org.demo.conf.cxbox.customization.locale.PlatformLocaleEnum;
import org.springframework.context.i18n.LocaleContextHolder;

public final class LocaleEnumUtil {

	private LocaleEnumUtil() {
	}

	public static <E extends Enum<E> & PlatformLocaleEnum<E>> String toValue(
			@NonNull PlatformLocaleEnum<E> e
	) {
		Locale locale = LocaleContextHolder.getLocale();
		return e.translations()
				.getOrDefault(
						locale,
						e.translations().values().stream().findFirst().orElseThrow()
				)
				.get();
	}

	public static <E extends Enum<E> & PlatformLocaleEnum<E>> Optional<E> fromValue(
			@NonNull Class<E> enumClass,
			@NonNull String value
	) {
		Map<String, E> map = new HashMap<>();
		for (E e : enumClass.getEnumConstants()) {
			for (var entry : e.translations().entrySet()) {
				map.put(entry.getValue().get(), e);
			}
		}
		return Optional.ofNullable(map.get(value));
	}

}