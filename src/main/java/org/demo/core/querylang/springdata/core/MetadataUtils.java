package org.demo.core.querylang.springdata.core;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.FetchParent;
import jakarta.persistence.criteria.From;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import jakarta.persistence.metamodel.Bindable;
import jakarta.persistence.metamodel.Bindable.BindableType;
import jakarta.persistence.metamodel.ManagedType;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.demo.core.querylang.common.DtoToEntityFilterParameterMapper;
import org.demo.core.querylang.common.EntityFieldFilterParameter;
import org.demo.core.querylang.common.FilterParameters;
import org.demo.core.querylang.common.SearchParameter;
import org.demo.core.querylang.common.filterMapper.AutoMapper;
import org.springframework.util.ReflectionUtils;

@Slf4j
@UtilityClass
public class MetadataUtils {

	public static boolean mayBeNull(Root<?> root, Path path) {
		Bindable model = path.getModel();
		BindableType type = model.getBindableType();
		if (type != BindableType.SINGULAR_ATTRIBUTE) {
			return true;
		}
		// джойн
		if (path.getParentPath() != root) {
			return true;
		}
		return !model.getBindableJavaType().isPrimitive();
	}

	public static Comparable requireComparable(Object value) {
		if (value instanceof Comparable) {
			return (Comparable) value;
		} else {
			throw new IllegalArgumentException();
		}
	}

	public static String requireString(Object value) {
		if (value instanceof String) {
			return (String) value;
		} else {
			throw new IllegalArgumentException();
		}
	}

	public static JoinType getJoinType(From from, String attrName) {
		JoinType joinType = JoinType.INNER;
		Bindable model = from.getModel();
		if (model.getBindableType() == BindableType.ENTITY_TYPE) {
			ManagedType managedType = (ManagedType) model;
			if (managedType.getAttribute(attrName).isAssociation()) {
				joinType = JoinType.LEFT;
			}
		}
		return joinType;
	}

	public static JoinType getJoinType(FetchParent fetch, String attrName) {
		// todo: похоже так всегда и бывает
		if (fetch instanceof From) {
			return getJoinType((From) fetch, attrName);
		}
		return JoinType.LEFT;
	}

	@SuppressWarnings("unchecked")
	public static Join joinEntity(From from, String attrName) {
		Set<Join> joins = from.getJoins();
		for (Join join : joins) {
			if (join.getAttribute().getName().equals(attrName)) {
				return join;
			}
		}
		return from.join(attrName, getJoinType(from, attrName));
	}

	public static Path getFieldPath(String fieldName, Root<?> root) {
		if (fieldName.contains(".")) {
			String[] fieldArr = fieldName.split("\\.");
			From partialFrom = root;
			for (int i = 0; i < fieldArr.length - 1; i++) {
				partialFrom = joinEntity(partialFrom, fieldArr[i]);
			}
			return partialFrom.get(fieldArr[fieldArr.length - 1]);
		}
		if (isElementCollectionField(root, fieldName)) {
			return root.join(fieldName);
		}
		return root.get(fieldName);
	}

	public static <T> Predicate getPredicateFromSearchParams(Root<T> root, CriteriaQuery<?> cq, CriteriaBuilder cb,
			Class<?> dtoClazz, FilterParameters<?> filterParameters, List<DtoToEntityFilterParameterMapper> providers) {

		if (filterParameters == null) {
			return cb.and();
		}
		List<EntityFieldFilterParameter> criteriaStrings = map(dtoClazz, filterParameters, providers);
		boolean joinRequired = criteriaStrings.stream()
				.anyMatch(param -> param.getEntityFieldPath().contains("."));

		Predicate filterPredicate;
		if (joinRequired) {
			Subquery<Long> filterSubquery = cq.subquery(Long.class);
			Class<T> rootClass = root.getModel().getJavaType();
			Root<T> subRoot = filterSubquery.from(rootClass);
			Predicate searchParamsRestriction = getAllSpecifications(cb, subRoot, criteriaStrings);
			filterSubquery.select(subRoot.get("id"))
					.where(searchParamsRestriction);
			filterPredicate = cb.in(root.get("id")).value(filterSubquery);
		} else {
			filterPredicate = getAllSpecifications(cb, root, criteriaStrings);
		}
		return filterPredicate;
	}

	private static List<EntityFieldFilterParameter> map(Class<?> dtoClazz, FilterParameters<?> filterParameters,
			List<DtoToEntityFilterParameterMapper> filterParameterMappers) {
		List<EntityFieldFilterParameter> result = new ArrayList<>();

		if (filterParameters == null) {
			return new ArrayList<>();
		}
		var parameters = filterParameters.getParameters();
		parameters.forEach(filterParam -> {
					try {
						Field dtoField = Optional.ofNullable(ReflectionUtils.findField(dtoClazz, filterParam.getDtoFieldName()))
								.orElseThrow(
										() -> new IllegalArgumentException(
												"error.class_field_not_found " + filterParam.getDtoFieldName() + " " + dtoClazz.getName())
								);
						SearchParameter searchParam = dtoField.getDeclaredAnnotation(SearchParameter.class);
						Optional<DtoToEntityFilterParameterMapper> provider = getFilterMapper(dtoField, filterParameterMappers);
						provider
								.ifPresent(
										filterParameterMapper -> result.addAll(filterParameterMapper.map(
												dtoField,
												filterParam,
												searchParam != null ? searchParam.name() : dtoField.getName(),
												filterParameterMapper.getClass()
										))
								);
					} catch (Exception e) {
						log.warn("error.failed_to_parse_filter_param " + filterParam, e);
						throw e;
					}

				}
		);
		return result;
	}

	public Optional<DtoToEntityFilterParameterMapper> getFilterMapper(Field dtoField,
			List<DtoToEntityFilterParameterMapper> filterParameterMappers) {

		SearchParameter searchParam = dtoField.getDeclaredAnnotation(SearchParameter.class);
		Class<? extends DtoToEntityFilterParameterMapper> provider;
		if (searchParam != null) {
			provider = searchParam.provider();
		} else {
			provider = AutoMapper.class;
		}
		return filterParameterMappers.stream().filter(p -> p.getClass().equals(provider))
				.findFirst();
	}

	public static Predicate getAllSpecifications(CriteriaBuilder cb, Root<?> root,
			List<EntityFieldFilterParameter> criteriaStrings) {
		return cb.and(criteriaStrings.stream()
				.map(criteria -> getSingleSpecification(cb, root, criteria))
				.filter(Objects::nonNull).toArray(Predicate[]::new));
	}

	private static Predicate getSingleSpecification(CriteriaBuilder cb, Root<?> root,
			EntityFieldFilterParameter criteria) {
//		if (MultisourceValueProvider.class.equals(criteria.getProvider())) {
//			List criteriaValue = (List) criteria.getValue();
//			List<Predicate> predicates = new ArrayList<>();
//			for (Object innerList : criteriaValue) {
//				predicates.add(getAllSpecifications(cb, root, (List) innerList));
//			}
//			return cb.or(predicates.stream().filter(Objects::nonNull).toArray(Predicate[]::new));
//		} else {
		return createPredicate(root, criteria, cb);
//		}
	}

	public static Predicate createPredicate(Root<?> root, EntityFieldFilterParameter criteria, CriteriaBuilder cb) {
		try {
			Object value = criteria.getValue();

			Path field = getFieldPath(criteria.getEntityFieldPath(), root);

			switch (criteria.getOperator()) {
				case EQUALS:
					if (value instanceof String) {
						return cb.equal(cb.upper(field), requireString(value).toUpperCase());
					} else {
						return cb.equal(field, value);
					}
				case CONTAINS:
					return cb.like(cb.upper(field), "%" + requireString(value).toUpperCase() + "%");
				case GREATER_THAN:
					return cb.greaterThan(field, requireComparable(value));
				case LESS_THAN:
					return cb.lessThan(field, requireComparable(value));
				case GREATER_OR_EQUAL_THAN:
					return cb.greaterThanOrEqualTo(field, requireComparable(value));
				case LESS_OR_EQUAL_THAN:
					return cb.lessThanOrEqualTo(field, requireComparable(value));
//				case INTERVALS:
//					return cb.or(((List<Period>) value).stream()
//							.map(object ->
//									cb.and(
//											cb.greaterThanOrEqualTo(field, requireComparable(object.getStart())),
//											cb.lessThanOrEqualTo(field, requireComparable(object.getEnd()))
//									))
//							.toArray(Predicate[]::new));
				case SPECIFIED:
					boolean isSpecified = Boolean.TRUE.equals(value);
//					if (BooleanValueProvider.class.equals(criteria.getProvider())) {
//						return isSpecified ?
//								cb.equal(field, true) :
//								mayBeNull(root, field) ?
//										cb.or(cb.isNull(field), cb.equal(field, false)) :
//										cb.equal(field, false);
//					} else {
					return isSpecified ?
							cb.isNotNull(field) :
							cb.isNull(field);
//					}
				case EQUALS_ONE_OF:
					if (((List<Object>) value).stream().allMatch(((s) -> s instanceof String))) {
						return cb.or(((List<Object>) value).stream()
								.map(object -> cb.equal(cb.upper(field), requireString(object).toUpperCase()))
								.toArray(Predicate[]::new));
					} else {
						return cb
								.or(((List<Object>) value).stream().map(object -> cb.equal(field, object)).toArray(Predicate[]::new));
					}
				case CONTAINS_ONE_OF:
					return cb.or(((List<Object>) value)
							.stream()
							.map(object -> cb
									.like(cb.upper(field), "%".concat(requireString(object).toUpperCase()).concat("%")))
							.toArray(Predicate[]::new));
				default:
					throw new IllegalArgumentException();
			}
		} catch (Exception e) {
			log.warn("error when try to parse search expr: "
					+ criteria.getEntityFieldPath() + "." + criteria.getOperator() + "=" + criteria.getValue(), e);
			return null;
		}
	}


	private boolean isElementCollectionField(Root<?> root, String fieldName) {
		Class<?> rootClass = root.getModel().getJavaType();
		Field field = org.springframework.data.util.ReflectionUtils.findField(
				rootClass,
				fld -> fieldName.equals(fld.getName())
		);
		return Optional.ofNullable(field)
				.map(fld -> fld.isAnnotationPresent(ElementCollection.class))
				.orElseThrow(() -> new IllegalArgumentException(
								String.format(
										"Couldn't find field %s in entity %s",
										fieldName,
										rootClass.getName()
								)
						)
				);
	}

	public static String getEntityFieldPath(Class dtoClazz, String dtoFieldName) {
		String field;
		if (dtoClazz == null) {
			field = dtoFieldName;
		} else {
			Field dtoField = ReflectionUtils.findField(dtoClazz, dtoFieldName);
			if (dtoField == null) {
				throw new IllegalArgumentException(
						"Couldn't find field " + dtoFieldName + " in class " + dtoClazz.getName());
			}
			SearchParameter fieldParameter = dtoField.getDeclaredAnnotation(SearchParameter.class);
			if (fieldParameter != null && !"".equals(fieldParameter.name())) {
				field = fieldParameter.name();
			} else {
				field = dtoFieldName;
			}
		}
		return field;
	}

}
