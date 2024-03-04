package org.demo.microservice.core.querylang.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
@Builder
public class EntityFieldFilterParameter {

	private String entityFieldPath;

	private SearchOperation operator;

	private Object value;

	private Class<? extends DtoToEntityFilterParameterMapper> provider;

}
