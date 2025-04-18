package org.demo.conf;

import java.util.concurrent.Executors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.config.CxboxBeanProperties;
import org.cxbox.api.service.tx.ITransactionStatus;
import org.cxbox.core.config.APIConfig;
import org.cxbox.core.config.ControllerScan;
import org.cxbox.core.config.CoreApplicationConfig;
import org.cxbox.core.config.JacksonConfig;
import org.cxbox.core.config.LocalizationConfig;
import org.cxbox.core.config.UIConfig;
import org.cxbox.core.config.properties.WidgetFieldsIdResolverProperties;
import org.cxbox.meta.MetaApplicationConfig;
import org.cxbox.meta.metahotreload.conf.MetaHotReloadConfiguration;
import org.cxbox.model.core.config.PersistenceJPAConfig;
import org.cxbox.model.core.tx.CxboxJpaTransactionManagerForceActiveAware;
import org.demo.util.IntegrationConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ConcurrentTaskExecutor;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SuppressWarnings("java:S5122")
@Configuration
@RequiredArgsConstructor
@Import({
		MetaHotReloadConfiguration.class,
		MetaApplicationConfig.class,
		CoreApplicationConfig.class,
		PersistenceJPAConfig.class,
		UIConfig.class,
		APIConfig.class,
		LocalizationConfig.class,
		JacksonConfig.class
})
@ControllerScan({"org.cxbox.meta"})
@EnableJpaRepositories(basePackages = "org.demo")
@EnableAsync
@EntityScan({"org.cxbox", "org.demo"})
@EnableConfigurationProperties({IntegrationConfiguration.class, WidgetFieldsIdResolverProperties.class})
public class ApplicationConfig {

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(@NonNull CorsRegistry registry) {
				registry
						.addMapping("/**")
						.allowedMethods("*")
						.allowedOriginPatterns("*")
						.allowedHeaders("*");
			}

			@Override
			public void configureAsyncSupport(@NonNull AsyncSupportConfigurer configurer) {
				configurer.setTaskExecutor(taskExecutor());
			}
		};
	}

	@Bean
	protected ConcurrentTaskExecutor taskExecutor() {
		return new ConcurrentTaskExecutor(Executors.newFixedThreadPool(5));
	}

	@Bean
	public PlatformTransactionManager transactionManager(
			final ApplicationContext applicationContext,
			final CxboxBeanProperties cxboxBeanProperties,
			final ITransactionStatus txStatus) {
		return new CxboxJpaTransactionManagerForceActiveAware(applicationContext, cxboxBeanProperties, txStatus);
	}

}
