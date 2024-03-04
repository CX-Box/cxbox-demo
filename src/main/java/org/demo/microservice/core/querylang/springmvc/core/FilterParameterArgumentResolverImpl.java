package org.demo.microservice.core.querylang.springmvc.core;

import java.util.Arrays;
import lombok.NonNull;
import org.demo.microservice.core.querylang.common.FilterParameters;
import org.springframework.core.MethodParameter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;


/**
 * Supports using FilterParameters directly as spring controller method argument
 */
public class FilterParameterArgumentResolverImpl implements HandlerMethodArgumentResolver,
		FilterParameterArgumentResolver {

	@Override
	public boolean supportsParameter(final MethodParameter methodParameter) {
		return methodParameter.getParameterType().isAssignableFrom(FilterParameters.class);
	}

	@Override
	public Object resolveArgument(@NonNull final MethodParameter methodParameter,
			final ModelAndViewContainer modelAndViewContainer,
			final NativeWebRequest nativeWebRequest, final WebDataBinderFactory webDataBinderFactory) {
		final MultiValueMap<String, String> parameters = new LinkedMultiValueMap<>();
		nativeWebRequest.getParameterMap().forEach(
				(parameter, values) -> parameters.addAll(parameter, Arrays.asList(values))
		);
		return FilterParameters.of(parameters);
	}

}
