package org.demo.conf.security.oidc;

import java.util.Set;
import org.cxbox.api.service.session.CxboxUserDetailsInterface;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class OidcAuthenticationToken extends JwtAuthenticationToken {

	public OidcAuthenticationToken(Jwt jwt, Set<GrantedAuthority> authorities, String name, CxboxUserDetailsInterface cxboxOidcAccount) {
		super(jwt, authorities, name);
		this.setDetails(cxboxOidcAccount);
	}

}
