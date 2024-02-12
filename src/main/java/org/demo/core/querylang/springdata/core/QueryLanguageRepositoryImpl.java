package org.demo.core.querylang.springdata.core;

import jakarta.persistence.EntityManager;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.BinaryOperator;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.demo.core.querylang.common.DtoToEntityFilterParameterMapper;
import org.demo.core.querylang.common.FilterParameters;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;
import org.springframework.data.jpa.domain.Specification;

@RequiredArgsConstructor
public class QueryLanguageRepositoryImpl<T, I> implements QueryLanguageRepository<T, I> {

	@NonNull
	private final EntityManager entityManager;

	@NonNull
	private final List<DtoToEntityFilterParameterMapper> providers;

	public static <T> Specification<T> and(final Collection<Specification<T>> specs) {
		return specs.stream().filter(Objects::nonNull).reduce(and()).orElse(trueSpecification());
	}

	public static <T> BinaryOperator<Specification<T>> and() {
		return (s1, s2) -> Specification.where(s1).and(s2);
	}

	public static <T> Specification<T> trueSpecification() {
		return Specification.where((root, cq, cb) -> cb.and());
	}

	@Override
	public Specification<T> getSpecification(final FilterParameters<?> parameters, final Class<?> dtoClass) {
		if (parameters == null) {
			return trueSpecification();
		}

		return (root, cq, cb) -> MetadataUtils.getPredicateFromSearchParams(root, cq, cb, dtoClass, parameters, providers);
	}

	@Override
	public Pageable getEntityPageable(@NonNull final Pageable dtoPageable, final Class<?> dtoClass) {
		final List<Order> entityOrderList = dtoPageable.getSort().stream()
				.map(dtoOrder -> new Order(
						dtoOrder.getDirection(),
						MetadataUtils.getEntityFieldPath(dtoClass, dtoOrder.getProperty())
				))
				.collect(Collectors.toList());
		final String entityIdField = "id";
//		if (ReflectionUtils.findField(GenericTypeResolver.resolveTypeArguments(getClass(), QueryLanguageRepository.class)[0], entityIdField) != null) {
		entityOrderList.add(Order.desc(entityIdField));
//		}
		return PageRequest.of(dtoPageable.getPageNumber(), dtoPageable.getPageSize(), Sort.by(entityOrderList));
	}

	@Override
	public T getReference(@NonNull final Class<T> entityClass, @NonNull final I id) {
		return entityManager.getReference(entityClass, id);
	}

	@Override
	public Optional<DtoToEntityFilterParameterMapper> getFilterMapper(Field dtoField) {
		return MetadataUtils.getFilterMapper(dtoField, providers);
	}

}
