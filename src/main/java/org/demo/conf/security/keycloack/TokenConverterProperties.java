package org.demo.conf.security.keycloack;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtClaimNames;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "token.converter")
public class TokenConverterProperties {

	private String resourceId;

	private String principalAttribute = JwtClaimNames.SUB;

}