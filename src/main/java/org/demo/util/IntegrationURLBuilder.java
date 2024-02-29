package org.demo.util;

import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class IntegrationURLBuilder {

	public String getURLWithParams(final BusinessComponent bc, final String baseURL) {
		final var builder = UriComponentsBuilder.fromHttpUrl(baseURL);
		Arrays.stream(IntegrationURLRules.values()).forEach(rule -> rule.getBuildURLFunc().accept(bc, builder));
		return builder.encode().toUriString();
	}

	public UriComponentsBuilder getURLWithQueryParams(final BusinessComponent bc, final String baseURL) {
		final UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseURL);
		Arrays.stream(IntegrationURLRules.values()).forEach(rule -> rule.getBuildURLFunc().accept(bc, builder));
		return builder;
	}

}