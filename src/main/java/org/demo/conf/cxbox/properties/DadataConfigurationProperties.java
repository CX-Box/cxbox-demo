package org.demo.conf.cxbox.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "integration.dadata")
public class DadataConfigurationProperties {

	private String baseUrl;

	private String apiKey;

}
