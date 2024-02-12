package org.demo.core.querylang.springdata.starter;

import jakarta.persistence.EntityManager;
import java.util.List;
import org.demo.core.querylang.common.DtoToEntityFilterParameterMapper;
import org.demo.core.querylang.common.filterMapper.AutoMapper;
import org.demo.core.querylang.springdata.core.QueryLanguageRepository;
import org.demo.core.querylang.springdata.core.QueryLanguageRepositoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
@ConditionalOnClass(QueryLanguageRepository.class)
public class SpringDataQueryLanguageConfiguration {

	@ConditionalOnMissingBean(QueryLanguageRepository.class)
	@Bean
	public <T, I> QueryLanguageRepository<T, I> queryLanguageRepository(@Autowired EntityManager entityManager,
			@Autowired List<DtoToEntityFilterParameterMapper> providers) {
		return new QueryLanguageRepositoryImpl<>(entityManager, providers);
	}

	@ConditionalOnMissingBean(AutoMapper.class)
	@Bean
	public AutoMapper autoProvider() {
		return new AutoMapper();
	}

}
