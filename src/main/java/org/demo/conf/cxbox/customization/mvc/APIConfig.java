package org.demo.conf.cxbox.customization.mvc;


import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import lombok.AllArgsConstructor;
import org.cxbox.core.config.ControllerScan;
import org.cxbox.core.config.properties.APIProperties;
import org.cxbox.core.controller.param.resolvers.LocaleParameterArgumentResolver;
import org.cxbox.core.controller.param.resolvers.PageParameterArgumentResolver;
import org.cxbox.core.controller.param.resolvers.QueryParametersResolver;
import org.cxbox.core.controller.param.resolvers.TimeZoneParameterArgumentResolver;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.ResourceHttpMessageConverter;
import org.springframework.http.converter.ResourceRegionHttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@EnableWebMvc
@ControllerScan({"org.cxbox.core.controller"})
@AllArgsConstructor
@EnableConfigurationProperties(APIProperties.class)
public class APIConfig implements WebMvcConfigurer {

	@Qualifier("cxboxObjectMapper")
	protected final ObjectMapper objectMapper;

	@Override
	public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
		argumentResolvers.add(new PageParameterArgumentResolver());
		argumentResolvers.add(new QueryParametersResolver());
		argumentResolvers.add(new TimeZoneParameterArgumentResolver());
		argumentResolvers.add(new LocaleParameterArgumentResolver());
	}

	@Override
	public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
		converters.add(new StringHttpMessageConverter());
		converters.add(new ByteArrayHttpMessageConverter());
		converters.add(new MappingJackson2HttpMessageConverter(objectMapper));
		converters.add(new ResourceHttpMessageConverter());
		converters.add(new ResourceRegionHttpMessageConverter());
	}

	@SuppressWarnings("java:S5693")
	@Bean
	@ConditionalOnProperty(value = "cxbox.bean.multipart-resolver.enabled", matchIfMissing = true)
	public MultipartResolver multipartResolver() {
		StandardServletMultipartResolver resolver = new StandardServletMultipartResolver();
		/*resolver.setMaxUploadSize(268435456L);
		resolver.setDefaultEncoding(StandardCharsets.UTF_8.name());*/
		return resolver;
	}



}