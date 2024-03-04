package org.demo.conf.security.oidc;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Configuration
@Validated
@ConfigurationProperties(prefix = "token.converter")
public class TokenConverterProperties {

	@NotNull
	private String resourceId;

	private String principalAttribute = "preferred_username";

}