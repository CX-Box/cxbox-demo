package org.demo.conf.dadata.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "dadata.client")
public class DadataConfigurationProperties {

	private String baseUrl;

	private String token;

}
