package org.demo.util;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import lombok.experimental.UtilityClass;
import org.apache.commons.lang3.tuple.Pair;
import org.cxbox.core.crudma.bc.BusinessComponent;

@UtilityClass
public class BcParseHelper {

	private static final String DEFAULT_SORTING_FIELD_NAME = "created";

	private static final String DEFAULT_SORTING = "desc";

	public static Optional<Pair<String, String>> getFieldNameToSortType(final BusinessComponent bc) {
		for (Map.Entry<String, String> entry : bc.getParameters().getParameters().entrySet()) {
			String operation = entry.getKey();
			String fieldName = entry.getValue();
			if (operation.startsWith(ExternalQueryParameters.SORT_PARAM)) {
				String[] splitOperation = operation.split("\\.");
				return Optional.of(Pair.of(fieldName, splitOperation[splitOperation.length - 1]));
			}
		}
		return Optional.of(Pair.of(DEFAULT_SORTING_FIELD_NAME, DEFAULT_SORTING));
	}

	public static Map<String, String> getContainsParameters(final BusinessComponent bc) {
		Map<String, String> containsMap = new HashMap<>();
		bc.getParameters().getParameters().forEach((operation, field) -> {
			if (operation.endsWith(ExternalQueryParameters.CONTAINS_PREFIX)) {
				containsMap.put(operation, field);
			}
		});
		return containsMap;
	}

}
