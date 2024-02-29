package org.demo.microservice.conf;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestTemplate;

@Configuration
@RequiredArgsConstructor
public class ClientConfiguration {

	@Bean
	@Primary
	public RestTemplate restTemplate(final RestTemplateBuilder builder/*,
                                     final LogbookClientHttpRequestInterceptor logbookClientHttpRequestInterceptor,
                                     final RequestResponseInterceptor requestResponseInterceptor*/) {
		return builder
				/*.requestFactory(this::getRequestFactory)
				.additionalInterceptors(requestResponseInterceptor, logbookClientHttpRequestInterceptor)*/
				.build();
	}
/*
    private ClientHttpRequestFactory getRequestFactory() {
        return new BufferingClientHttpRequestFactory(
                new HttpComponentsClientHttpRequestFactory(HttpClients.createDefault())
        );
    }*/

}
