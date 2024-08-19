package org.demo.conf.security;


import static org.demo.conf.security.basic.AuthBasicConfigProperties.APP_AUTH_BASIC_PROP_ENABLED;
import static org.demo.conf.security.basic.AuthBasicConfigProperties.APP_AUTH_BASIC_PROP_PREFIX;

import org.cxbox.core.config.properties.UIProperties;
import org.cxbox.meta.metahotreload.conf.properties.MetaConfigurationProperties;
import org.demo.conf.security.basic.AuthBasicConfigProperties;
import org.demo.conf.security.basic.CustomBasicAuthenticationEntryPoint;
import org.demo.conf.security.oidc.CxboxAuthUserRepository;
import org.demo.conf.security.oidc.OidcJwtTokenConverter;
import org.demo.conf.security.oidc.TokenConverterProperties;
import org.demo.conf.cxbox.customization.role.UserService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@SuppressWarnings({"java:S4502", "java:S5122", "java:S5804"})
@EnableWebSecurity
@Configuration
public class SecurityConfig {

	private final UIProperties uiProperties;
	private final MetaConfigurationProperties metaConfigurationProperties;
	private final OidcJwtTokenConverter oidcJwtTokenConverter;
	private final AuthBasicConfigProperties authBasicConfigProperties;

	public SecurityConfig(UserService userService, UIProperties uiProperties, MetaConfigurationProperties metaConfigurationProperties, @Qualifier("tokenConverterProperties") TokenConverterProperties properties, CxboxAuthUserRepository cxboxAuthUserRepository,
			AuthBasicConfigProperties authBasicConfigProperties) {
		this.uiProperties = uiProperties;
		this.metaConfigurationProperties = metaConfigurationProperties;
		this.authBasicConfigProperties = authBasicConfigProperties;
		this.oidcJwtTokenConverter = new OidcJwtTokenConverter(new JwtGrantedAuthoritiesConverter(), properties,
				userService, cxboxAuthUserRepository
		);
	}

	@Bean
	@ConditionalOnProperty(prefix = APP_AUTH_BASIC_PROP_PREFIX, name = APP_AUTH_BASIC_PROP_ENABLED)
	public BasicAuthenticationEntryPoint customBasicAuthenticationEntryPoint() {
		return new CustomBasicAuthenticationEntryPoint("CustomRealm");
	}

	@Bean
	@ConditionalOnProperty(prefix = APP_AUTH_BASIC_PROP_PREFIX, name = APP_AUTH_BASIC_PROP_ENABLED)
	public PasswordEncoder encoder() {
		return PasswordEncoderFactories.createDelegatingPasswordEncoder();
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
				.csrf(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(authorizeRequests -> authorizeRequests
						.requestMatchers("/rest/**").permitAll()
						.requestMatchers("/css/**").permitAll()
						.requestMatchers(uiProperties.getPath() + "/**").permitAll()
						.requestMatchers("/").permitAll()
						.requestMatchers("/actuator/metrics/**").permitAll()
						.requestMatchers("/api/v1/auth/**").permitAll()
						.requestMatchers("/api/v1/websocketnotification/**").permitAll()
						.requestMatchers("/swagger-ui/**").permitAll()
						.requestMatchers("/v3/api-docs/**").permitAll()
						.requestMatchers("/api/v1/notification/**").permitAll()
						.requestMatchers("/**").fullyAuthenticated())
		;
		if (Boolean.TRUE.equals(authBasicConfigProperties.getEnabled())) {
			http.httpBasic(c -> c.authenticationEntryPoint(customBasicAuthenticationEntryPoint()));
		} else {
			http
					.oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer
							.jwt(jwt -> jwt.jwtAuthenticationConverter(oidcJwtTokenConverter)));
		}
		return http.build();
	}

}
