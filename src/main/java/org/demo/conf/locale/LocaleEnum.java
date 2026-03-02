package org.demo.conf.locale;

import java.util.Locale;
import java.util.Map;
import java.util.function.Supplier;
/**
 * <p>
 * Each enum constant must define a value for every supported {@link Locale}.
 * Localization is configured via the {@link #translations()} map.
 * </p>
 *
 * <h3>Adding support for a new language</h3>
 * <ol>
 *   <li>Add a new getter method for the language value
 *       (for example {@code getValueDe()} for German).</li>
 *   <li>Extend the {@link #translations()} map with the corresponding {@link Locale}
 *       and method reference.</li>
 * </ol>
 *
 * <h4>Example</h4>
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
 *             Locale.ENGLISH, this::getValue,
 *             Locale.FRANCE, this::getValueFr,
 *             Locale.GERMANY, this::getValueDe
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
		return  Map.of(
				Locale.ENGLISH, this::getValue,
				Locale.FRENCH, this::getValueFr
		);
	}
}