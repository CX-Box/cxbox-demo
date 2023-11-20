package org.demo.conf.security.keycloack;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.cxbox.api.data.dictionary.LOV;
import org.demo.conf.security.cxboxkeycloak.CxboxAuthUserRepository;
import org.demo.conf.security.cxboxkeycloak.CxboxKeycloakAccount;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

public class KeycloakJwtTokenConverter implements Converter<Jwt, KeycloakAuthenticationToken> {
	private static final String RESOURCE_ACCESS = "resource_access";
	private static final String ROLES = "roles";
	private static final String ROLE_PREFIX = "ROLE_";
	private final JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter;
	private final TokenConverterProperties properties;
	private final CxboxAuthUserRepository cxboxAuthUserRepository;

	public KeycloakJwtTokenConverter(
			JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter,
			TokenConverterProperties properties, CxboxAuthUserRepository cxboxAuthUserRepository) {
		this.jwtGrantedAuthoritiesConverter = jwtGrantedAuthoritiesConverter;
		this.properties = properties;
		this.cxboxAuthUserRepository = cxboxAuthUserRepository;
	}

	@Override
	public KeycloakAuthenticationToken convert(@NonNull Jwt jwt) {
		List<SimpleGrantedAuthority> roles = Optional.of(jwt)
				.map(token -> token.getClaimAsMap(RESOURCE_ACCESS))
				.map(claimMap -> (Map<String, Object>) claimMap.get(properties.getResourceId()))
				.map(resourceData -> (Collection<String>) resourceData.get(ROLES))
				.stream()
				.map(role -> new SimpleGrantedAuthority(role.stream().collect(Collectors.joining(""))))
				.collect(Collectors.toList());

		Set<GrantedAuthority> authorities = Stream
				.concat(jwtGrantedAuthoritiesConverter.convert(jwt).stream(), roles.stream())
				.collect(Collectors.toSet());

		String login = jwt.getClaimAsString(properties.getPrincipalAttribute()).toUpperCase();

		Long userId = cxboxAuthUserRepository.getUserIdOrElseCreate(
				login,
				roles.stream().map(SimpleGrantedAuthority::getAuthority).collect(Collectors.toSet())
		);

		CxboxKeycloakAccount cxboxKeycloakAccount = new CxboxKeycloakAccount()
				.setId(userId)
				.setUsername(login)
				.setAuthorities(new HashSet<>(roles))
				.setUserRole(new LOV(roles.stream().findFirst().get().getAuthority()));
		return new KeycloakAuthenticationToken(jwt, authorities, properties.getPrincipalAttribute(), cxboxKeycloakAccount);


	}
}
