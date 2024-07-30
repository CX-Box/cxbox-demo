package org.demo.microservice.core.querylang.common;

import java.lang.reflect.Field;
import java.util.List;
import lombok.NonNull;
import org.demo.microservice.core.querylang.common.FilterParameters.DtoFieldFilterParameter;

public interface DtoToEntityFilterParameterMapper {

	/**
	 * @param dtoField DTO field to search or sort by
	 * @param filterParam Filter parameter that defines the type of operation and the values to filter
	 * @return Classify Data Parameters for defining of predicates of searching data in Persistence Layer
	 */
	List<EntityFieldFilterParameter> map(@NonNull Field dtoField, DtoFieldFilterParameter<?> filterParam, String path,
			Class<? extends DtoToEntityFilterParameterMapper> provider);

	List<SearchOperation> availableOperations(@NonNull Field dtoField);

}
