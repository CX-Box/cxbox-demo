package org.demo.conf.security.basic;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Setter
@Getter
@ConfigurationProperties(prefix = AuthBasicConfigProperties.APP_AUTH_BASIC_PROP_PREFIX)
public class AuthBasicConfigProperties {

	public static final String APP_AUTH_BASIC_PROP_PREFIX = "app.auth-basic";

	public static final String APP_AUTH_BASIC_PROP_ENABLED = "enabled";

	private Boolean enabled = false;

}
