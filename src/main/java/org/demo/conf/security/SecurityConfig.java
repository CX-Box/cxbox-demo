package org.demo.conf.security;


import static org.demo.conf.security.basic.AuthBasicConfigProperties.APP_AUTH_BASIC_PROP_ENABLED;
import static org.demo.conf.security.basic.AuthBasicConfigProperties.APP_AUTH_BASIC_PROP_PREFIX;
import static org.keycloak.adapters.springsecurity.filter.KeycloakAuthenticationProcessingFilter.DEFAULT_REQUEST_MATCHER;

import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.service.session.CxboxAuthenticationService;
import org.cxbox.core.config.properties.UIProperties;
import org.cxbox.core.metahotreload.conf.properties.MetaConfigurationProperties;
import org.demo.conf.security.basic.AuthBasicConfigProperties;
import org.demo.conf.security.basic.CustomBasicAuthenticationEntryPoint;
import org.demo.conf.security.cxboxkeycloak.CxboxKeycloakAuthenticationProvider;
import org.keycloak.adapters.KeycloakConfigResolver;
import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.keycloak.adapters.springsecurity.KeycloakConfiguration;
import org.keycloak.adapters.springsecurity.KeycloakSecurityComponents;
import org.keycloak.adapters.springsecurity.authentication.KeycloakAuthenticationProvider;
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter;
import org.keycloak.adapters.springsecurity.filter.KeycloakAuthenticationProcessingFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.BeanIds;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.util.matcher.AndRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

@SuppressWarnings({"java:S4502", "java:S5122", "java:S5804"})
@EnableWebSecurity
@ComponentScan(basePackageClasses = KeycloakSecurityComponents.class)
@RequiredArgsConstructor
@Order(100)
@KeycloakConfiguration
@Configuration
public class SecurityConfig extends KeycloakWebSecurityConfigurerAdapter {

	@Autowired
	private CxboxAuthenticationService cxboxAuthenticationService;

	@Autowired
	private UIProperties uiProperties;

	@Autowired
	private CxboxKeycloakAuthenticationProvider cxboxKeycloakAuthenticationProvider;

	@Autowired
	private MetaConfigurationProperties metaConfigurationProperties;

	@Autowired
	private AuthBasicConfigProperties authBasicConfigProperties;

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		super.configure(http);
		http.csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
		http.cors();
		http.headers().frameOptions().sameOrigin();
		if (metaConfigurationProperties.isDevPanelEnabled()) {
			http.authorizeRequests().antMatchers("/api/v1/bc-registry/**").authenticated();
		} else {
			http.authorizeRequests().antMatchers("/api/v1/bc-registry/**").denyAll();
		}
		http
				.csrf().disable()
				.authorizeRequests(authorizeRequests -> authorizeRequests
						.antMatchers("/rest/**").permitAll()
						.antMatchers("/css/**").permitAll()
						.antMatchers(uiProperties.getPath() + "/**").permitAll()
						.antMatchers("/api/v1/file/**").permitAll()
						.antMatchers("/api/v1/auth/**").permitAll()
						.antMatchers("/actuator/metrics/**").permitAll()
						.antMatchers("/**").fullyAuthenticated());

		if (Boolean.TRUE.equals(authBasicConfigProperties.getEnabled())) {
			http.addFilterBefore(keycloakAuthenticationProcessingFilter(), BasicAuthenticationFilter.class);
			http.httpBasic().authenticationEntryPoint(customBasicAuthenticationEntryPoint());
		}

	}

	@SuppressWarnings("java:S5344")
	@Override
	public void configure(AuthenticationManagerBuilder authenticationManagerBuilder) throws Exception {
		KeycloakAuthenticationProvider keycloakAuthenticationProvider = keycloakAuthenticationProvider();
		keycloakAuthenticationProvider.setGrantedAuthoritiesMapper(new SimpleAuthorityMapper());
		authenticationManagerBuilder.authenticationProvider(keycloakAuthenticationProvider);
		authenticationManagerBuilder.userDetailsService(cxboxAuthenticationService);
	}

	@Override
	protected KeycloakAuthenticationProvider keycloakAuthenticationProvider() {
		return cxboxKeycloakAuthenticationProvider;
	}

	@Bean
	@Override
	protected SessionAuthenticationStrategy sessionAuthenticationStrategy() {
		return new RegisterSessionAuthenticationStrategy(new SessionRegistryImpl());
	}

	@Bean
	public KeycloakConfigResolver keycloakConfigResolver() {
		return new KeycloakSpringBootConfigResolver();
	}

	@Bean(BeanIds.AUTHENTICATION_MANAGER)
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}

	@Bean
	@ConditionalOnProperty(prefix = APP_AUTH_BASIC_PROP_PREFIX, name = APP_AUTH_BASIC_PROP_ENABLED, matchIfMissing = false)
	public BasicAuthenticationEntryPoint customBasicAuthenticationEntryPoint() {
		return new CustomBasicAuthenticationEntryPoint("CustomRealm");
	}


	@Bean
	@Override
	protected KeycloakAuthenticationProcessingFilter keycloakAuthenticationProcessingFilter() throws Exception {
		if (Boolean.TRUE.equals(authBasicConfigProperties.getEnabled())) {
			RequestMatcher requestMatcher = new AndRequestMatcher(DEFAULT_REQUEST_MATCHER, new IgnoreKeycloakProcessingFilterRequestMatcher());
			return new KeycloakAuthenticationProcessingFilter(authenticationManagerBean(), requestMatcher);
		}
		return super.keycloakAuthenticationProcessingFilter();
	}

	public static class IgnoreKeycloakProcessingFilterRequestMatcher implements RequestMatcher {

		public boolean matches(HttpServletRequest request) {
			String authorizationHeaderValue = request.getHeader("Authorization");
			return authorizationHeaderValue != null && !authorizationHeaderValue.startsWith("Basic ");
		}

	}

	@Bean
	@ConditionalOnProperty(prefix = APP_AUTH_BASIC_PROP_PREFIX, name = APP_AUTH_BASIC_PROP_ENABLED, matchIfMissing = false)
	public PasswordEncoder encoder() {
		return PasswordEncoderFactories.createDelegatingPasswordEncoder();
	}

}
