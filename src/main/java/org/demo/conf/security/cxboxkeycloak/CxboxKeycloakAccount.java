package org.demo.conf.security.cxboxkeycloak;


import org.cxbox.api.data.dictionary.LOV;
import org.cxbox.api.service.session.CxboxUserDetailsInterface;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.keycloak.adapters.RefreshableKeycloakSecurityContext;
import org.keycloak.adapters.springsecurity.account.SimpleKeycloakAccount;
import org.springframework.security.core.GrantedAuthority;

import java.security.Principal;
import java.util.Set;

@Getter
@Setter
@Accessors(chain = true)
public class CxboxKeycloakAccount extends SimpleKeycloakAccount implements CxboxUserDetailsInterface {

	private static final long serialVersionUID = 4714671346784362939L;

	private Long id;

	private String username;

	private String password;

	private LOV userRole;

	private LOV timezone;

	private LOV localeCd;

	private Set<GrantedAuthority> authorities;

	public CxboxKeycloakAccount(Principal principal, Set<String> roles,
			RefreshableKeycloakSecurityContext securityContext) {
		super(principal, roles, securityContext);
	}

	public boolean isAccountNonExpired() {
		return true;
	}

	public boolean isAccountNonLocked() {
		return true;
	}

	public boolean isCredentialsNonExpired() {
		return true;
	}

	public boolean isEnabled() {
		return true;
	}

}