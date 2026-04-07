package org.demo.conf.security;

import java.util.function.Supplier;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;

@Component
public class NonEmptyRolesAuthorizationManager
		implements AuthorizationManager<RequestAuthorizationContext> {

	@Override
	public AuthorizationDecision check(Supplier<Authentication> authentication,
			RequestAuthorizationContext context) {

		Authentication auth = authentication.get();

		if (auth == null || !auth.isAuthenticated()) {
			return new AuthorizationDecision(false);
		}

		boolean hasRoles = auth.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.anyMatch(a -> !a.startsWith("SCOPE_"));

		return new AuthorizationDecision(hasRoles);
	}

}