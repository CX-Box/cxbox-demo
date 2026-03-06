package org.demo.conf.cxbox.extension.locale;

import java.util.Locale;
import java.util.Map;
import java.util.function.Supplier;
import org.demo.conf.cxbox.customization.dictionary.service.SupportedLanguages;

/**
 * Adding support for a new language
 * Example
 * <pre>{@code
 * public interface LocaleEnum<E extends Enum<E> & PlatformLocaleEnum<E>>
 *         extends PlatformLocaleEnum<E> {
 *
 *     String getValue();
 *     String getValueFr();
 *     String getValueDe();
 *
 *     @Override
 *     default Map<Locale, Supplier<String>> translations() {
 *         return Map.of(
 *             SupportedLanguages.ENGLISH.getLocale(), this::getValue,
 *             SupportedLanguages.FRENCH.getLocale(), this::getValueFr,
 *             SupportedLanguages.GERNANY.getLocale(), this::getValueDe
 *         );
 *     }
 * }
 * }</pre>
 *
 */

public interface LocaleEnum<E extends Enum<E> & PlatformLocaleEnum<E>>
		extends PlatformLocaleEnum<E> {

	String getValue();

	String getValueFr();

	@Override
	default Map<Locale, Supplier<String>> translations() {
		return Map.of(
				SupportedLanguages.getDefaultLocale(), this::getValue,
				SupportedLanguages.FRENCH.getLocale(), this::getValueFr
		);
	}

}