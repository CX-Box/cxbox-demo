/*
 *
 *  *
 *  *  *
 *  *  *  * Copyright 2019-2022 the original author or authors.
 *  *  *  *
 *  *  *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  *  *  * you may not use this file except in compliance with the License.
 *  *  *  * You may obtain a copy of the License at
 *  *  *  *
 *  *  *  *      https://www.apache.org/licenses/LICENSE-2.0
 *  *  *  *
 *  *  *  * Unless required by applicable law or agreed to in writing, software
 *  *  *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  *  *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  *  *  * See the License for the specific language governing permissions and
 *  *  *  * limitations under the License.
 *  *  *
 *  *
 *
 */

package org.demo.microservice.core.querylang.springdoc.starter;

import static org.springdoc.core.utils.Constants.SPRINGDOC_ENABLED;
import static org.springdoc.core.utils.SpringDocUtils.getConfig;

import java.util.Optional;
import org.demo.microservice.core.querylang.common.FilterParameters;
import org.demo.microservice.core.querylang.springdata.core.QueryLanguageRepository;
import org.demo.microservice.core.querylang.springdata.starter.SpringDataQueryLanguageConfiguration;
import org.demo.microservice.core.querylang.springdoc.core.QueryLanguageFilterParamsOperationCustomizer;
import org.demo.microservice.core.querylang.springdoc.core.QueryLanguageFilterParamsOperationCustomizerImpl;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;


@Lazy(false)
@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(name = SPRINGDOC_ENABLED, matchIfMissing = true)
@ConditionalOnBean(QueryLanguageRepository.class)
@AutoConfigureAfter(SpringDataQueryLanguageConfiguration.class)
public class SpringDocQueryLanguageConfiguration {


	@ConditionalOnClass(value = {QueryLanguageRepository.class})
	static class QueryLanguageProvider {

		@ConditionalOnMissingBean(QueryLanguageFilterParamsOperationCustomizer.class)
		@Bean
		@Lazy(false)
		QueryLanguageFilterParamsOperationCustomizer queryLanguageFilterParamsOperationCustomizer(
				@Qualifier("queryLanguageRepositoryImpl") Optional<QueryLanguageRepository<?, ?>> queryLanguageRepository) {
			if (queryLanguageRepository.isPresent()) {
				getConfig().addRequestWrapperToIgnore(FilterParameters.class);
				return new QueryLanguageFilterParamsOperationCustomizerImpl(queryLanguageRepository.get());
			}
			return null;
		}

	}

}
