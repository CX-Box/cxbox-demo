package org.demo.conf.locale;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

public class DynamicLocaleResolver extends AcceptHeaderLocaleResolver {

	@NotNull
	@Override
	public Locale resolveLocale(@NotNull HttpServletRequest request) {
		return resolveLocale();
	}

	public Locale resolveLocale() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		if (auth == null) {
			return null;
		}

		if (auth.getPrincipal() instanceof Jwt jwt) {
			String locale = jwt.getClaimAsString("locale");
			if (locale.endsWith("fr")) {
				return Locale.FRENCH;
			}
			return Locale.ENGLISH;
		}

		return Locale.ENGLISH;
	}


}