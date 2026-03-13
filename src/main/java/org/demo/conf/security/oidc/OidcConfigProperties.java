package org.demo.conf.security.oidc;

import java.util.Map;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Setter
@Getter
@ConfigurationProperties(prefix = "app")
public class OidcConfigProperties {

	/**
	 * Frontend-supported OIDC properties.
	 * <p><b>Important:</b> Keys must match the case used in
	 * <a href="https://authts.github.io/oidc-client-ts/interfaces/UserManagerSettings.html">UserManagerSettings</a>.
	 * See the <a href="https://openid.net/specs/openid-connect-core-1_0.html">OIDC specification</a>
	 * for OAuth provider compatibility (e.g., Keycloak, Google, Microsoft etc.).
	 */
	private Map<String, Object> oidc;

}
