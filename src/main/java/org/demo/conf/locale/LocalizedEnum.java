package org.demo.conf.locale;

import java.lang.reflect.Field;

public interface LocalizedEnum {

	default String getValueEn() {
		return getFieldValue("value");
	}

	default String getValueFr() {
		return getFieldValue("valueFr");
	}

	private String getFieldValue(String fieldName) {
		try {
			Field field = this.getClass().getDeclaredField(fieldName);
			field.setAccessible(true);
			Object value = field.get(this);
			return value != null ? value.toString() : null;
		} catch (Exception e) {
			throw new IllegalStateException(
					"Enum " + this.getClass().getSimpleName()
							+ " must declare field '" + fieldName + "'",
					e
			);
		}
	}
}
