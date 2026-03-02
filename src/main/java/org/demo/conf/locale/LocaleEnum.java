package org.demo.conf.locale;

import java.util.Locale;
import java.util.Map;
import java.util.function.Supplier;

public interface LocaleEnum<E extends Enum<E>> extends PlatformLocaleEnum<E> {
	
	String getValue();

	String getValueFr();

	default Map<Locale, Supplier<String>> translations() {
		return Map.of(
				Locale.ENGLISH, this::getValue,
				Locale.FRANCE, this::getValueFr
		);
	}
	
}
