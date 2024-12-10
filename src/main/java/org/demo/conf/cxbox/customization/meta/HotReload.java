package org.demo.conf.cxbox.customization.meta;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.cxbox.api.MetaHotReloadService;
import org.cxbox.api.service.session.InternalAuthorizationService;
import org.cxbox.api.service.tx.TransactionService;
import org.cxbox.dictionary.DictionaryProvider;
import org.cxbox.meta.metahotreload.conf.properties.MetaConfigurationProperties;
import org.cxbox.meta.metahotreload.repository.MetaRepository;
import org.cxbox.meta.metahotreload.service.MetaResourceReaderService;
import org.demo.repository.core.RoleActionRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class HotReload {

	@Bean
	@Primary
	public MetaHotReloadService metaHotReloadService(MetaConfigurationProperties config,
			MetaResourceReaderService metaResourceReaderService,
			InternalAuthorizationService authzService,
			TransactionService txService,
			MetaRepository metaRepository, ObjectMapper objectMapper, RoleActionRepository roleActionRepository,
			DictionaryProvider dictionaryProvider)  {
		return new MetaHotReloadServiceImpl2(
				config,
				metaResourceReaderService,
				authzService,
				txService,
				metaRepository, objectMapper, roleActionRepository, dictionaryProvider);
	}
}
