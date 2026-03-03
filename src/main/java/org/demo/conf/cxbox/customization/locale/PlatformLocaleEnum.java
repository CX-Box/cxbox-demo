package org.demo.conf.cxbox.customization.locale;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;
import java.util.Map;
import java.util.function.Supplier;
import org.demo.conf.cxbox.extension.locale.LocaleEnumUtil;

public interface PlatformLocaleEnum<E extends Enum<E> & PlatformLocaleEnum<E>> {

	Map<Locale, Supplier<String>> translations();

	@JsonValue
	default String toValue() {
		return LocaleEnumUtil.toValue(this);
	}

	@JsonCreator
	default E fromValue(String value) {
		return LocaleEnumUtil
				.fromValue((Class<E>) this.getClass(), value)
				.orElse(null);
	}

}