package org.demo.microservice.core.querylang.springmvc.core;

import io.micrometer.common.util.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.core.MethodParameter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class PageableArgumentResolverImpl extends PageableHandlerMethodArgumentResolver {

	private static final int DEFAULT_PAGE_SIZE = 5;

	@NotNull
	@Override
	public Pageable resolveArgument(@NotNull MethodParameter parameter, ModelAndViewContainer mavContainer,
			NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
		String page = webRequest.getParameter("_page");
		String size = webRequest.getParameter("_size");
		String sort = webRequest.getParameter("_sort");
		String order = webRequest.getParameter("_order");

		int pageNumber = (page != null && Integer.parseInt(page) > 0) ? Integer.parseInt(page) - 1 : 0;
		int pageSize = (size != null) ? Integer.parseInt(size) : DEFAULT_PAGE_SIZE;
		Direction direction = Direction.ASC.name().equalsIgnoreCase(order) ? Direction.ASC : Direction.DESC;
		return (StringUtils.isBlank(sort) ? PageRequest.of(pageNumber, pageSize) :
				PageRequest.of(pageNumber, pageSize, Sort.by(direction, sort)));
	}

}
