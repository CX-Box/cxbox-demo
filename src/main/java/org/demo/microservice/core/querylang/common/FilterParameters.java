package org.demo.microservice.core.querylang.common;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.util.CollectionUtils;
import org.springframework.util.MultiValueMap;

@Getter
@RequiredArgsConstructor
public class FilterParameters<D> {

	public static final String FILTER_FIELD_PREFIX = "_filter.field.";

	private final List<DtoFieldFilterParameter<D>> parameters;

	//TODO>> add private final String fullTextSearchString;

	public static <T> FilterParameters<T> of(final MultiValueMap<String, String> parameters) {
		return new FilterParameters<>(parameters.entrySet().stream()
				.filter(params -> Objects.nonNull(params.getKey()))
				.filter(params -> !CollectionUtils.isEmpty(params.getValue()))
				.filter(params -> params.getKey().contains(FILTER_FIELD_PREFIX))
				.map(params -> {
					final String[] param = params.getKey().replace(FILTER_FIELD_PREFIX, "").split("\\.");
					return params.getValue().stream()
							.map(value -> new DtoFieldFilterParameter<T>(param[0], SearchOperation.of(param[1]), value)).toList();
				}).flatMap(Collection::stream).toList());
	}

	@Getter
	@RequiredArgsConstructor
	public static class DtoFieldFilterParameter<D> {

		private final String dtoFieldName;

		private final SearchOperation operation;

		private final String stringValue;

	}

}
