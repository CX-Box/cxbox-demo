package org.demo.conf.security;


import org.demo.conf.security.cxboxkeycloak.CxboxKeycloakAuthenticationProvider;
import org.cxbox.api.service.session.CxboxAuthenticationService;
import org.cxbox.core.config.properties.UIProperties;
import org.cxbox.core.metahotreload.conf.properties.MetaConfigurationProperties;
import lombok.RequiredArgsConstructor;
import org.keycloak.adapters.KeycloakConfigResolver;
import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.keycloak.adapters.springsecurity.KeycloakConfiguration;
import org.keycloak.adapters.springsecurity.KeycloakSecurityComponents;
import org.keycloak.adapters.springsecurity.authentication.KeycloakAuthenticationProvider;
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

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
						.antMatchers("/**").fullyAuthenticated());
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

}
