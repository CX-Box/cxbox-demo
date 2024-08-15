package org.demo.conf.dadata.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.demo.conf.dadata.DadataClient;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

@Configuration()
public class DadataConfig {

	@Bean
	public DadataClient dadataClient(RestTemplateBuilder restTemplateBuilder,
			DadataConfigurationProperties dadataConfigurationProperties) {
		var restTemplate = restTemplateBuilder.detectRequestFactory(true)
				.rootUri(dadataConfigurationProperties.getBaseUrl())
				.additionalInterceptors((request, body, execution) -> {
					request.getHeaders().set(HttpHeaders.AUTHORIZATION, "Token " + dadataConfigurationProperties.getToken());
					return execution.execute(request, body);
				})
				.messageConverters(new MappingJackson2HttpMessageConverter(new Jackson2ObjectMapperBuilder().featuresToEnable(
						DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_USING_DEFAULT_VALUE,
						DeserializationFeature.FAIL_ON_NUMBERS_FOR_ENUMS
				).build())).build();
		return new DadataClient(restTemplate);
	}

}
