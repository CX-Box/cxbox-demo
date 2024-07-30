package org.demo.microservice.core.querylang.common.filterMapper;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import lombok.EqualsAndHashCode;
import lombok.NonNull;
import org.demo.microservice.core.querylang.common.DtoToEntityFilterParameterMapper;
import org.demo.microservice.core.querylang.common.EntityFieldFilterParameter;
import org.demo.microservice.core.querylang.common.FilterParameters.DtoFieldFilterParameter;
import org.demo.microservice.core.querylang.common.SearchOperation;


@EqualsAndHashCode(callSuper = false)
public class AutoMapper implements DtoToEntityFilterParameterMapper {

	public static final String AUTO_MAPPER_ID_REFERENCING_FIELDS_POSTFIX = "Id";

	private static boolean isIdReference(Field dtoField) {
		return dtoField.getName().endsWith(AUTO_MAPPER_ID_REFERENCING_FIELDS_POSTFIX) || dtoField.getName()
				.endsWith(AUTO_MAPPER_ID_REFERENCING_FIELDS_POSTFIX.toLowerCase());
	}

	private static EntityFieldFilterParameter mapFilterParam(DtoFieldFilterParameter<?> dtoFieldFilterParameter,
			String path, Class<? extends DtoToEntityFilterParameterMapper> provider) {
		return EntityFieldFilterParameter.builder()
				.operator(dtoFieldFilterParameter.getOperation())
				.provider(provider)
				.entityFieldPath(path)
				.build();
	}

	@Override
	public List<EntityFieldFilterParameter> map(@NonNull Field dtoField, DtoFieldFilterParameter<?> filterParam,
			String path, Class<? extends DtoToEntityFilterParameterMapper> provider) {
		if (filterParam.getStringValue() == null) {
			new ArrayList<>();
		}
		return Optional.ofNullable(filterParam.getStringValue())
				.map(val -> {
					String[] split = val.split(",");
					if (split.length > 1) {
						return Arrays.stream(split).map(arrValue -> convertStringToDtoFieldType(arrValue, dtoField)).toList();
					}
					return convertStringToDtoFieldType(val, dtoField);
				})
				.map(val -> mapFilterParam(filterParam, path, provider).setValue(val))
				.stream()
				.toList();
	}

	public List<SearchOperation> availableOperations(@NonNull Field dtoField) {
		final Class<?> type = dtoField.getType();
		if (Long.TYPE.isAssignableFrom(type) || Long.class.isAssignableFrom(type)) {
			if (isIdReference(dtoField)) {
				return List.of(SearchOperation.EQUALS, SearchOperation.EQUALS_ONE_OF);
			} else {
				return List.of(SearchOperation.EQUALS);
			}
		}
		if (Integer.TYPE.isAssignableFrom(type) || Integer.class.isAssignableFrom(type)) {
			if (isIdReference(dtoField)) {
				return List.of(SearchOperation.EQUALS, SearchOperation.EQUALS_ONE_OF);
			} else {
				return List.of(SearchOperation.EQUALS);
			}
		}
		if (BigDecimal.class.isAssignableFrom(type)) {
			return List.of(SearchOperation.EQUALS);
		}
		if (Boolean.TYPE.isAssignableFrom(type) || Boolean.class.isAssignableFrom(type)) {
			return List.of(SearchOperation.SPECIFIED);
		}
		if (LocalDate.class.isAssignableFrom(type)) {
			return List.of(SearchOperation.GREATER_OR_EQUAL_THAN, SearchOperation.LESS_OR_EQUAL_THAN);
		}
		if (LocalDateTime.class.isAssignableFrom(type)) {
			return List.of(SearchOperation.GREATER_OR_EQUAL_THAN, SearchOperation.LESS_OR_EQUAL_THAN);
		}
		if (String.class.isAssignableFrom(type)) {
			if (isIdReference(dtoField)) {
				return List.of(SearchOperation.EQUALS, SearchOperation.EQUALS_ONE_OF);
			} else {
				return List.of(SearchOperation.CONTAINS, SearchOperation.CONTAINS_ONE_OF);
			}
		}
		return new ArrayList<>();
	}

	private Object convertStringToDtoFieldType(String val, Field dtoField) {
		final Class<?> type = dtoField.getType();
		if (Long.TYPE.isAssignableFrom(type) || Long.class.isAssignableFrom(type)) {
			return Long.parseLong(val);
		}
		if (Integer.TYPE.isAssignableFrom(type) || Integer.class.isAssignableFrom(type)) {
			return Integer.parseInt(val);
		}
		if (BigDecimal.class.isAssignableFrom(type)) {
			return new BigDecimal(val);
		}
		if (Boolean.TYPE.isAssignableFrom(type) || Boolean.class.isAssignableFrom(type)) {
			return Boolean.parseBoolean(val);
		}
		if (LocalDate.class.isAssignableFrom(type)) {
			return LocalDate.parse(val);
		}
		if (LocalDateTime.class.isAssignableFrom(type)) {
			return LocalDateTime.parse(val);
		}
		//TODO enum
		return val;
	}

}
