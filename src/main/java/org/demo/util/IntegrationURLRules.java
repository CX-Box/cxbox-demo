package org.demo.util;

import static org.demo.core.querylang.common.FilterParameters.FILTER_FIELD_PREFIX;

import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.function.BiConsumer;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.tuple.Pair;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.springframework.web.util.UriComponentsBuilder;

@Getter
@RequiredArgsConstructor
public enum IntegrationURLRules {

	PAGE("_page", (bc, builder) -> builder.queryParam("_page", bc.getParameters().getParameter("_page"))),
	LIMIT("_limit", (bc, builder) -> builder.queryParam("_limit", bc.getParameters().getParameter("_limit"))),
	SORT(
			GpnQueryParameters.SORT_PARAM,
			(bc, builder) -> {
				Optional<Pair<String, String>> fieldNameToSortType = BcParseHelper.getFieldNameToSortType(bc);
				builder.queryParamIfPresent(
								GpnQueryParameters.SORT_PARAM,
								fieldNameToSortType.map(pair -> Optional.of(pair.getLeft()))
						)
						.queryParamIfPresent(
								GpnQueryParameters.ORDER_PARAM,
								fieldNameToSortType.map(pair -> Optional.of(pair.getRight()))
						);
			}
	),
	FILTER(GpnQueryParameters.CONTAINS_PREFIX, (bc, builder) -> {
		Map<String, String> containsParameters = BcParseHelper.getContainsParameters(bc);
		for (Entry<String, String> entry : containsParameters.entrySet()) {
			String key = entry.getKey();
			String value = entry.getValue();
			builder.queryParam(FILTER_FIELD_PREFIX + key, value);
		}
	}
	);

	private final String contains;

	private final BiConsumer<BusinessComponent, UriComponentsBuilder> buildURLFunc;

}
