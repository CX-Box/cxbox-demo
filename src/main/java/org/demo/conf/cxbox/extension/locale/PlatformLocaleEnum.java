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
 * Interface for enums
 */
public interface PlatformLocaleEnum<E extends Enum<E> & PlatformLocaleEnum<E>> {

	Map<Locale, Supplier<@NonNull String>> translations();

	/**
	 * Converts this enum constant to its string representation based on the current locale.
	 */
	@JsonValue
	default String toValue() {
		return toValue(this);
	}

	/**
	 * Creates an enum constant from its string representation.
	 */
	@JsonCreator
	@SuppressWarnings("unchecked")
	default E fromValue(@NonNull String value) {
		return fromValue((Class<E>) this.getClass(), value);
	}

	/**
	 * Converts this enum constant to its string representation based on the current locale.
	 * <p>
	 * Serialization logic. The current locale is obtained
	 * from {@link LocaleContextHolder}. If no translation exists for the current locale,
	 * the first available translation is used as a fallback.
	 * </p>
	 *
	 */
	static <E extends Enum<E> & PlatformLocaleEnum<E>> String toValue(
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

	/**
	 * Creates an enum constant of the specified type from its string representation.
	 * <p>
	 * Deserialization logic. It builds
	 * a reverse lookup map from all translated values to their corresponding enum constants
	 * and uses it to find the matching constant.
	 * </p>
	 */
	static <E extends Enum<E> & PlatformLocaleEnum<E>> E fromValue(
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

}