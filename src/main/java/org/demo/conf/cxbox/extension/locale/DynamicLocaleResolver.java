package org.demo.conf.cxbox.extension.locale;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;
import org.demo.conf.cxbox.customization.dictionary.service.SupportedLanguages;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

public class DynamicLocaleResolver extends AcceptHeaderLocaleResolver {

	@NotNull
	@Override
	public Locale resolveLocale(@NotNull HttpServletRequest request) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
			return SupportedLanguages.getDefaultLocale();
		}
		return resolveFromJwt(jwt);
	}

	private Locale resolveFromJwt(Jwt jwt) {
		String localeClaim = jwt.getClaimAsString("locale");

		if (localeClaim == null || localeClaim.isBlank()) {
			return SupportedLanguages.getDefaultLocale();
		}

		return SupportedLanguages.FRENCH.getLocale().getLanguage().equals(localeClaim.toLowerCase()) ?
				SupportedLanguages.FRENCH.getLocale() :
				SupportedLanguages.getDefaultLocale();
	}

}