package org.demo.conf.cxbox.extension.locale;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.function.Supplier;
import lombok.NonNull;
import org.springframework.context.i18n.LocaleContextHolder;

/**
 * Utility and interface for enums with locale-specific translations.
 */
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

	public static <E extends Enum<E> & PlatformLocaleEnum<E>> E fromValue(
			@NonNull Class<E> enumClass,
			@NonNull String value
	) {
		Map<String, E> map = new HashMap<>();
		for (E e : enumClass.getEnumConstants()) {
			for (var entry : e.translations().entrySet()) {
				if (entry != null && entry.getValue() != null) {
					map.put(entry.getValue().get(), e);
				}
			}
		}
		return map.get(value);
	}

	/**
	 * Interface for enums
	 */
	public interface PlatformLocaleEnum<E extends Enum<E> & PlatformLocaleEnum<E>> {

		Map<Locale, Supplier<@NonNull String>> translations();

		@JsonValue
		default String toValue() {
			return LocaleEnumUtil.toValue(this);
		}

		@JsonCreator
		@SuppressWarnings("unchecked")
		default E fromValue(@NonNull String value) {
			return LocaleEnumUtil.fromValue((Class<E>) this.getClass(), value);
		}
	}
}