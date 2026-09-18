package org.demo.conf.cxbox.extension.ai.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.demo.conf.cxbox.extension.ai.AiProperties.Endpoint;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

@Slf4j
@RequiredArgsConstructor
public class OpenAiCompatibleChatClient implements ChatClient {

	private final Endpoint endpoint;

	private final RestClient restClient;

	private final ObjectMapper objectMapper;

	@Override
	public boolean available() {
		return StringUtils.isNotBlank(endpoint.getBaseUrl()) && StringUtils.isNotBlank(endpoint.getModel());
	}

	@Override
	@SneakyThrows
	@NonNull
	public String complete(@NonNull String system, @NonNull String user, String jsonSchema) {
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("model", endpoint.getModel());
		body.put("temperature", endpoint.getTemperature());
		body.put("max_tokens", endpoint.getMaxTokens());
		body.put("stream", false);
		List<Map<String, Object>> messages = new ArrayList<>();
		messages.add(Map.of("role", "system", "content", system));
		messages.add(Map.of("role", "user", "content", user));
		body.put("messages", messages);
		if (StringUtils.isNotBlank(jsonSchema)) {
			body.put("response_format", Map.of(
					"type", "json_schema",
					"json_schema", Map.of(
							"name", "extraction",
							"schema", objectMapper.readTree(jsonSchema)
					)
			));
		}
		body.putAll(endpoint.getExtraBody());

		long started = System.currentTimeMillis();
		String response = restClient.post()
				.uri("/chat/completions")
				.contentType(MediaType.APPLICATION_JSON)
				.body(body)
				.retrieve()
				.body(String.class);
		JsonNode answer = objectMapper.readTree(response).path("choices").path(0).path("message").path("content");
		log.info("ai: model {} answered in {} ms", endpoint.getModel(), System.currentTimeMillis() - started);
		return answer.asText("");
	}

}
