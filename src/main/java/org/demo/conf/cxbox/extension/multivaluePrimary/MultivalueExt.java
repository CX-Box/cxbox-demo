package org.demo.conf.cxbox.extension.multivaluePrimary;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collector;
import lombok.experimental.UtilityClass;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.dto.multivalue.MultivalueFieldSingleValue;

@UtilityClass
public class MultivalueExt {

	public static final String PRIMARY = "primary";

	public static <T> Collector<T, MultivalueField, MultivalueField> toMultivalueField(
			Function<T, String> idMapper,
			Function<T, String> valueMapper,
			Map<String, Function<T, String>> optionsMapper
	) {
		return Collector.of(
				MultivalueField::new,
				(result, value) -> {
					MultivalueFieldSingleValue singleValue = new MultivalueFieldSingleValue(
							idMapper.apply(value),
							valueMapper.apply(value)
					);
					optionsMapper.forEach((optionKey, optionValue) -> singleValue.getOptions()
							.put(optionKey, optionValue.apply(value)));
					result.getValues().add(singleValue);
				},
				(result1, result2) -> {
					result1.getValues().addAll(result2.getValues());
					return result1;
				}
		);
	}

	public static ObjectMapper addMultivaluePrimaryMixIn(ObjectMapper dtoPropertyFilter) {
		return dtoPropertyFilter
				.addMixIn(MultivalueFieldSingleValue.class, MultivalueFieldSingleValueMixin.class);
	}

}
