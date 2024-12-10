package org.demo.conf.security.oidc;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.cxbox.api.service.session.CxboxUserDetailsInterface;
import org.cxbox.core.config.properties.UIProperties;
import org.demo.conf.cxbox.customization.role.UserService;
import org.demo.entity.core.User;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

public class OidcJwtTokenConverter implements Converter<Jwt, OidcAuthenticationToken> {

	private static final String RESOURCE_ACCESS = "resource_access";

	private static final String ROLES = "roles";

	private static final String ROLE_PREFIX = "ROLE_";

	private final JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter;

	private final TokenConverterProperties properties;

	private final UserService userService;

	private final CxboxAuthUserRepository cxboxAuthUserRepository;

	private final UIProperties uiProperties;

	public OidcJwtTokenConverter(
			JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter,
			TokenConverterProperties properties, UserService userService, CxboxAuthUserRepository cxboxAuthUserRepository,
			UIProperties uiProperties) {
		this.jwtGrantedAuthoritiesConverter = jwtGrantedAuthoritiesConverter;
		this.properties = properties;
		this.userService = userService;
		this.cxboxAuthUserRepository = cxboxAuthUserRepository;
		this.uiProperties = uiProperties;
	}

	@Override
	public OidcAuthenticationToken convert(@NonNull Jwt jwt) {
		List<SimpleGrantedAuthority> roles = Optional.of(jwt)
				.map(token -> token.getClaimAsMap(RESOURCE_ACCESS))
				.map(claimMap -> (Map<String, Object>) claimMap.get(properties.getResourceId()))
				.map(resourceData -> (Collection<String>) resourceData.get(ROLES))
				.stream()
				.flatMap(Collection::stream)
				.map(SimpleGrantedAuthority::new)
				.collect(Collectors.toList());

		Set<GrantedAuthority> authorities = Stream
				.concat(jwtGrantedAuthoritiesConverter.convert(jwt).stream(), roles.stream())
				.collect(Collectors.toSet());

		String login = jwt.getClaimAsString(properties.getPrincipalAttribute()).toUpperCase();

		User user = cxboxAuthUserRepository.getUserIdOrElseCreate(
				login,
				roles.stream().map(SimpleGrantedAuthority::getAuthority).collect(Collectors.toSet())
		);

		CxboxUserDetailsInterface userDetails = userService.createUserDetails(
				user,
				uiProperties.isMultiRoleEnabled()
						? roles.stream().map(SimpleGrantedAuthority::getAuthority).collect(Collectors.toSet())
						: roles.stream().findFirst().map(SimpleGrantedAuthority::getAuthority).map(Set::of).orElse(new HashSet<>())
		);
		return new OidcAuthenticationToken(jwt, authorities, login, userDetails);


	}

}
