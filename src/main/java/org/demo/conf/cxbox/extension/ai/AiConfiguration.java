package org.demo.conf.cxbox.extension.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.cxbox.core.file.service.CxboxFileService;
import org.demo.conf.cxbox.extension.ai.AiProperties.Endpoint;
import org.demo.conf.cxbox.extension.ai.llm.ChatClient;
import org.demo.conf.cxbox.extension.ai.llm.OpenAiCompatibleChatClient;
import org.demo.conf.cxbox.extension.ai.mapping.FieldMapper;
import org.demo.conf.cxbox.extension.ai.mapping.LlmFieldMapper;
import org.demo.conf.cxbox.extension.ai.recognize.DocumentRecognizer;
import org.demo.conf.cxbox.extension.ai.recognize.PairExtractor;
import org.demo.conf.cxbox.extension.ai.recognize.PdfTextLayerRecognizer;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(AiProperties.class)
public class AiConfiguration {

	@Bean
	public DocumentRecognizer documentRecognizer() {
		return new PdfTextLayerRecognizer();
	}

	@Bean
	public PairExtractor pairExtractor() {
		return new PairExtractor();
	}

	@Bean
	public ChatClient mappingChatClient(AiProperties properties, ObjectMapper objectMapper) {
		return new OpenAiCompatibleChatClient(properties.getMapping(), restClient(properties.getMapping()), objectMapper);
	}

	@Bean
	public FieldMapper fieldMapper(AiProperties properties, ChatClient mappingChatClient, ObjectMapper objectMapper) {
		return new LlmFieldMapper(mappingChatClient, properties.getMapping(), objectMapper);
	}

	@Bean
	public AiExtractService aiExtractService(CxboxFileService fileService, DocumentRecognizer documentRecognizer,
			PairExtractor pairExtractor, FieldMapper fieldMapper, AiProperties properties) {
		return new AiExtractService(fileService, documentRecognizer, pairExtractor, fieldMapper, properties);
	}

	private RestClient restClient(Endpoint endpoint) {
		SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
		requestFactory.setConnectTimeout((int) endpoint.getTimeout().toMillis());
		requestFactory.setReadTimeout((int) endpoint.getTimeout().toMillis());
		RestClient.Builder builder = RestClient.builder()
				.baseUrl(StringUtils.defaultIfBlank(endpoint.getBaseUrl(), "http://localhost"))
				.requestFactory(requestFactory);
		if (StringUtils.isNotBlank(endpoint.getApiKey())) {
			builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + endpoint.getApiKey());
		}
		return builder.build();
	}

}
