package org.demo.client;


import org.demo.client.interceptor.DadataTokenRequestInterceptor;
import org.demo.conf.cxbox.properties.DadataConfigurationProperties;
import org.springframework.context.annotation.Bean;

public class DadataClientConfiguration {

	@Bean
	public DadataTokenRequestInterceptor tokenInterceptor(DadataConfigurationProperties properties) {
		return new DadataTokenRequestInterceptor(properties.getApiKey());
	}

}
