package org.demo.microservice.core.querylang.common;

import java.util.EnumSet;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SearchOperation {

	/**
	 * Equal
	 */
	EQUALS("equals", false),

	/**
	 * Greater
	 */
	GREATER_THAN("greaterThan", false),

	/**
	 * Less
	 */
	LESS_THAN("lessThan", false),

	/**
	 * Greater or equal
	 */
	GREATER_OR_EQUAL_THAN("greaterOrEqualThan", false),

	/**
	 * Less or equal
	 */
	LESS_OR_EQUAL_THAN("lessOrEqualThan", false),

	/**
	 * Contains
	 */
	CONTAINS("contains", false),

	/**
	 * Specified
	 */
	SPECIFIED("specified", false),

	/*	*//**
	 * Boolean value specified, use for sql entities
	 *//*
	SPECIFIED_BOOLEAN_SQL("specifiedBooleanSql"),*/

	/**
	 * Equal to one of the list
	 */
	EQUALS_ONE_OF("equalsOneOf", true),

	/**
	 * Contains one from the list
	 */
	CONTAINS_ONE_OF("containsOneOf", true)/*,

	 *//**
	 * Specified value in intervals
	 *//*
	INTERVALS("intervals")*/;

	public static final Map<String, SearchOperation> OPERATIONS = EnumSet.allOf(SearchOperation.class).stream()
			.collect(Collectors.toMap(
					(Function<? super SearchOperation, ? extends String>) SearchOperation::getOperationName,
					Function.identity()
			));

	private final String operationName;

	private final boolean isArray;

	public static SearchOperation of(String operationName) {
		if (!OPERATIONS.containsKey(operationName)) {
			throw new RuntimeException("Неизвестная операция поиска: + " + operationName);
		}
		return OPERATIONS.get(operationName);
	}

}
