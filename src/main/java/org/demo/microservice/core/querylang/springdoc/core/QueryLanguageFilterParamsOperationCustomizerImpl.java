package org.demo.microservice.core.querylang.springdoc.core;


import static org.demo.microservice.core.querylang.common.FilterParameters.FILTER_FIELD_PREFIX;

import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.core.converter.ResolvedSchema;
import io.swagger.v3.core.util.PrimitiveType;
import io.swagger.v3.core.util.ReflectionUtils;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.media.ArraySchema;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.parameters.Parameter;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.demo.microservice.core.querylang.common.DtoToEntityFilterParameterMapper;
import org.demo.microservice.core.querylang.common.FilterParameters;
import org.demo.microservice.core.querylang.common.SearchOperation;
import org.demo.microservice.core.querylang.springdata.core.QueryLanguageRepository;
import org.springdoc.core.customizers.GlobalOperationCustomizer;
import org.springframework.core.MethodParameter;
import org.springframework.util.CollectionUtils;
import org.springframework.web.method.HandlerMethod;

/**
 * Supports open-api swagger documentation for spring controller methods using FilterParameters as method argument
 */
@SuppressWarnings("unchecked")
@RequiredArgsConstructor
public class QueryLanguageFilterParamsOperationCustomizerImpl implements GlobalOperationCustomizer,
		QueryLanguageFilterParamsOperationCustomizer {

	private final QueryLanguageRepository queryLanguageRepository;

	@Override
	public Operation customize(Operation operation, HandlerMethod handlerMethod) {
		MethodParameter[] methodParameters = handlerMethod.getMethodParameters();

		List<Parameter> parametersToAddToOperation = new ArrayList<>();
		for (MethodParameter parameter : methodParameters) {
			if (!parameter.getParameterType().isAssignableFrom(FilterParameters.class)) {
				continue;
			}

			Type parameterType = parameter.getGenericParameterType();
			if (!(parameterType instanceof ParameterizedType)) {
				continue;
			}
			ParameterizedType genericParameterType = (ParameterizedType) parameter.getGenericParameterType();
			if (genericParameterType.getActualTypeArguments() == null
					|| genericParameterType.getActualTypeArguments().length != 1) {
				continue;
			}
			Class<?> clazz = (Class<?>) genericParameterType.getActualTypeArguments()[0];
			List<Field> fieldsToAdd = ReflectionUtils.getDeclaredFields(clazz).stream()
					.filter(field -> !Modifier.isStatic(field.getModifiers())).toList();

			for (Field field : fieldsToAdd) {
				Type type = field.getType();
				Optional<DtoToEntityFilterParameterMapper> filterMapper = queryLanguageRepository.getFilterMapper(field);
				filterMapper.ifPresent(m -> m.availableOperations(field).forEach(availableOperation -> {
					Parameter newParameter = buildParam(
							type,
							FILTER_FIELD_PREFIX + field.getName() + "." + availableOperation.getOperationName(),
							availableOperation
					);
					parametersToAddToOperation.add(newParameter);
				}));
			}
		}

		if (!CollectionUtils.isEmpty(parametersToAddToOperation)) {
			if (operation.getParameters() == null) {
				operation.setParameters(parametersToAddToOperation);
			} else {
				operation.getParameters().addAll(parametersToAddToOperation);
			}
		}

		return operation;
	}


	/***
	 * Constructs the parameter
	 * @param type The type of the parameter
	 * @param name The name of the parameter
	 * @param availableOperation
	 * @return The swagger parameter
	 */
	private Parameter buildParam(Type type, String name, SearchOperation availableOperation) {

		Parameter parameter = new Parameter();

		if (StringUtils.isBlank(parameter.getName())) {
			parameter.setName(name);
		}

		if (StringUtils.isBlank(parameter.getIn())) {
			parameter.setIn("query");
		}

		if (parameter.getSchema() == null) {
			Schema<?> schema;
			PrimitiveType primitiveType = PrimitiveType.fromType(type);
			if (primitiveType != null) {
				schema = primitiveType.createProperty();
			} else {
				ResolvedSchema resolvedSchema = ModelConverters.getInstance()
						.resolveAsResolvedSchema(
								new io.swagger.v3.core.converter.AnnotatedType(type).resolveAsRef(true));
				// could not resolve the schema or this schema references other schema
				// we dont want this since there's no reference to the components in order to register a new schema if it doesnt already exist
				// defaulting to string
				if (resolvedSchema == null || !resolvedSchema.referencedSchemas.isEmpty()) {
					schema = PrimitiveType.fromType(String.class).createProperty();
				} else {
					schema = resolvedSchema.schema;
				}
			}
			if (availableOperation.isArray()) {
				ArraySchema arraySchema = new ArraySchema();
				arraySchema.setItems(schema);
				parameter.setSchema(arraySchema);
				parameter.explode(Boolean.FALSE);
			} else {
				parameter.setSchema(schema);
			}

		}
		return parameter;
	}

}