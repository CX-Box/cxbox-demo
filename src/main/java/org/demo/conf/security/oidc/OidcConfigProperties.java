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
	 * <p>
	 * Whatever is put here reaches the browser as is and is spread over the settings the frontend builds for itself
	 * ({@code ui/src/auth/index.ts}), so a key given here wins over the value the application chose. Three of them are worth
	 * knowing about before they are set from a stand:
	 * <ul>
	 *     <li>{@code automaticSilentRenew} is safe either way. On (the default of oidc-client-ts): the access token is renewed
	 *     ahead of its expiry, once for all the tabs of the browser - by {@code ui/src/auth/rotationSafeUserManager}, not by the
	 *     library, whose own renewal runs in every tab at once with the one refresh token they share. Off: the token is
	 *     renewed only right before a request that needs it.</li>
	 *     <li>{@code requestTimeoutInSeconds} and {@code silentRequestTimeoutInSeconds} can be made longer from here, but not
	 *     removed: anything but a positive number is replaced by the value of the frontend, because without a timeout a
	 *     request to the OIDC provider waits as long as the socket lives.</li>
	 *     <li>{@code silent_redirect_uri} is set by the frontend deliberately and can be overridden from here. An address the
	 *     OIDC provider does not allow as a redirect breaks the renewal through the iframe quietly.</li>
	 * </ul>
	 * The first two items are about {@code USER_MANAGER = 'rotationSafe'} in {@code ui/src/constants/index.ts}, the default.
	 * With {@code 'original'} plain oidc-client-ts works with these keys as before 3.0.2.
	 */
	private Map<String, Object> oidc;

}
