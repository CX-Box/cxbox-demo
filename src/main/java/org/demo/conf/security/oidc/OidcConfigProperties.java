package org.demo.conf.security.oidc;

import java.util.Map;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Setter
@Getter
@ConfigurationProperties(prefix = "app")
public class OidcConfigProperties {

	private Map<String, Object> oidc;

}
