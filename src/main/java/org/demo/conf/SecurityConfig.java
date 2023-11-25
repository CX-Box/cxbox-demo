package org.demo.conf;


import org.cxbox.core.config.properties.UIProperties;
import org.cxbox.core.metahotreload.conf.properties.MetaConfigurationProperties;
import org.demo.conf.security.cxboxkeycloak.CxboxAuthUserRepository;
import org.demo.conf.security.keycloack.KeycloakJwtTokenConverter;
import org.demo.conf.security.keycloack.TokenConverterProperties;
import org.demo.service.core.UserService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@SuppressWarnings({"java:S4502", "java:S5122", "java:S5804"})
@EnableWebSecurity
@Configuration
public class SecurityConfig {

	private final UserService userService;
	private final UIProperties uiProperties;
	private final MetaConfigurationProperties metaConfigurationProperties;
	private final KeycloakJwtTokenConverter keycloakJwtTokenConverter;

	public SecurityConfig(UserService userService, UIProperties uiProperties, MetaConfigurationProperties metaConfigurationProperties, @Qualifier("tokenConverterProperties") TokenConverterProperties properties, CxboxAuthUserRepository cxboxAuthUserRepository) {
		this.userService = userService;
		this.uiProperties = uiProperties;
		this.metaConfigurationProperties = metaConfigurationProperties;
		this.keycloakJwtTokenConverter = new KeycloakJwtTokenConverter(new JwtGrantedAuthoritiesConverter(), properties,
				this.userService, cxboxAuthUserRepository
		);
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()));
		http.cors(cors -> cors.configure(http));
		http.headers(headers -> headers.frameOptions(FrameOptionsConfig::sameOrigin));
		if (metaConfigurationProperties.isDevPanelEnabled()) {
			http.authorizeHttpRequests(authorizeRequests -> authorizeRequests.requestMatchers("/api/v1/bc-registry/**")
					.authenticated());
		} else {
			http.authorizeHttpRequests(authorizeRequests -> authorizeRequests.requestMatchers("/api/v1/bc-registry/**")
					.denyAll());
		}
		http
				.oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer
						.jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtTokenConverter)));

		http
				.csrf(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(authorizeRequests -> authorizeRequests
						.requestMatchers("/rest/**").permitAll()
						.requestMatchers("/css/**").permitAll()
						.requestMatchers(uiProperties.getPath() + "/**").permitAll()
						.requestMatchers("/api/v1/file/**").permitAll()
						.requestMatchers("/api/v1/auth/**").permitAll()
						.requestMatchers("/**").fullyAuthenticated());
		return http.build();
	}

}
