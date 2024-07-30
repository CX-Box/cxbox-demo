package org.demo.microservice.core.querylang.springdata.core;

import java.lang.reflect.Field;
import java.util.Optional;
import lombok.NonNull;
import org.demo.microservice.core.querylang.common.DtoToEntityFilterParameterMapper;
import org.demo.microservice.core.querylang.common.FilterParameters;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

public interface QueryLanguageRepository<T, I> {

	/**
	 * @return Спецификация для фильтрации
	 */
	Specification<T> getSpecification(FilterParameters<?> parameters, Class<?> dtoClass);

	/**
	 * Маппинг сортировки полей в DTO на сортировку полей в Entity
	 *
	 * @return пагинация и сортировка для Entity
	 */
	Pageable getEntityPageable(@NonNull Pageable dtoPageable, Class<?> dtoClass);

	T getReference(Class<T> entityClass, I id);

	Optional<DtoToEntityFilterParameterMapper> getFilterMapper(Field dtoField);

}
