package org.demo.conf.security.keycloack;

import java.util.Set;
import org.cxbox.api.service.session.CxboxUserDetailsInterface;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class KeycloakAuthenticationToken extends JwtAuthenticationToken {

	public KeycloakAuthenticationToken(Jwt jwt, Set<GrantedAuthority> authorities, String name, CxboxUserDetailsInterface cxboxKeycloakAccount) {
		super(jwt, authorities, name);
		this.setDetails(cxboxKeycloakAccount);
	}

}
