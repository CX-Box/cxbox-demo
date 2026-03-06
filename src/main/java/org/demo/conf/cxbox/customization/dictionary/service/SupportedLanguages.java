package org.demo.conf.cxbox.customization.dictionary.service;

import java.util.Locale;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

/**
 * Enumeration of locales supported by the application.
 * <p>
 * For correct operation of a locale, ensure the following steps are properly configured:
 *
 * <p><b>Backend:</b></p>
 * <ul>
 *     <li>Register the locale in this enum by adding a new constant.</li>
 *     <li>Add the locale code to {@code cxbox.localization.supported-languages} in {@code application.yaml}:
 *     </li>
 *     <li>Add resource bundles {@code messages_<code>.properties} in {@code src/main/resources/ui/messages/} for static texts.</li>
 *     <li>To translate dictionaries and enums:
 *         <ul>
 *           <li>For enums: implement a project-level interface (example {@link org.demo.conf.cxbox.extension.locale.LocaleEnum},
 *           that extends the core interface {@link org.demo.conf.cxbox.extension.locale.PlatformLocaleEnum}) and provide translations in enum constants that inherit that interface.</li>
 *             <li>For dictionaries: add new columns in {@code DICTIONARY_ITEM} for the new language,
 *             and populate {@code dictionary_item_tr} with translations.</li>
 *         </ul>
 *     </li>
 * </ul>
 *
 * <p>
 *    Important: instruction written for cxbox version >= 2.0.18.
 *    For older versions, see <a href="https://github.com/CX-Box/cxbox-demo/pull/606">pull request</a> and change/add required file
 *   <b>Frontend:</b>
 * </p>
 * <ul>
 *     <li>Add a translation file {@code <code>.json} in {@code ui/src/i18n/assets/local/}.</li>
 *     <li>Register the locale in the following files:
 *         <ul>
 *             <li>{@code ui/src/i18n/assets/local/index.ts}</li>
 *             <li>{@code moment/index.ts} (for date/time formats)</li>
 *             <li>{@code antd/index.ts} (for Ant Design UI components)</li>
 *         </ul>
 *     </li>
 * </ul>
 *
 * <p>See the <a href="https://doc.cxbox.org/features/locale/locale/">official documentation</a>
 * for more details.</p>
 *
 * @see java.util.Locale
 */
@RequiredArgsConstructor
@Getter
public enum SupportedLanguages {

	ENGLISH(Locale.ENGLISH),
	FRENCH(Locale.FRENCH);

	private final Locale locale;

	public static @NonNull Locale getDefaultLocale() {
		return SupportedLanguages.ENGLISH.getLocale();
	}

}