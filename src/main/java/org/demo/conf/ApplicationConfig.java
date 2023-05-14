package org.demo.conf;

import org.cxbox.api.config.CxboxBeanProperties;
import org.cxbox.api.service.tx.ITransactionStatus;
import org.cxbox.core.config.APIConfig;
import org.cxbox.core.config.CoreApplicationConfig;
import org.cxbox.core.config.UIConfig;
import org.cxbox.model.core.config.PersistenceJPAConfig;
import org.cxbox.model.core.tx.CxboxJpaTransactionManagerForceActiveAware;
import java.util.concurrent.Executors;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.concurrent.ConcurrentTaskExecutor;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SuppressWarnings("java:S5122")
@Configuration
@RequiredArgsConstructor
@Import({
		CoreApplicationConfig.class,
		PersistenceJPAConfig.class,
		UIConfig.class,
		APIConfig.class
})
@EnableJpaRepositories(basePackages = "org.demo")
@EntityScan({"org.cxbox", "org.demo"})
public class ApplicationConfig {

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry
						.addMapping("/**")
						.allowedMethods("*")
						.allowedOrigins("*")
						.allowedHeaders("*");
			}

			@Override
			public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
				configurer.setTaskExecutor(getTaskExecutor());
			}
		};
	}

	@Bean
	protected ConcurrentTaskExecutor getTaskExecutor() {
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
