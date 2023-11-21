package org.demo.conf.security.keycloack;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import org.demo.conf.security.cxboxkeycloak.CxboxKeycloakAccount;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class KeycloakAuthenticationToken extends JwtAuthenticationToken {

	public KeycloakAuthenticationToken(Jwt jwt) {
		super(jwt);
		this.setDetails(new CxboxKeycloakAccount().setId(1L));
	}

	public KeycloakAuthenticationToken(Jwt jwt, Collection<? extends GrantedAuthority> authorities) {
		super(jwt, authorities);
		this.setDetails(new CxboxKeycloakAccount().setId(1L).setAuthorities(new HashSet<>(authorities)));
	}

	public KeycloakAuthenticationToken(Jwt jwt, Collection<? extends GrantedAuthority> authorities, String name) {
		super(jwt, authorities, name);
		this.setDetails(new CxboxKeycloakAccount().setId(1L).setAuthorities(new HashSet<>(authorities)));
	}

	public KeycloakAuthenticationToken(Jwt jwt, Set<GrantedAuthority> authorities, String name, CxboxKeycloakAccount cxboxKeycloakAccount) {
		super(jwt, authorities, name);
		this.setDetails(cxboxKeycloakAccount);
	}

}
