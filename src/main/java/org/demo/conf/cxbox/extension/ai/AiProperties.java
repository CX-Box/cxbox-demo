package org.demo.conf.cxbox.extension.ai;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings of two independent models: one recognizes the document, another lays the result out on form fields.
 * Both are configured the same way, so switching a provider is a property change, not a code change.
 */
@Data
@ConfigurationProperties(prefix = "demo.ai")
public class AiProperties {

	/** document -> text with coordinates */
	private Endpoint recognize = new Endpoint();

	/** recognized text + form fields -> values by field */
	private Endpoint mapping = new Endpoint();

	@Data
	public static class Endpoint {

		/** recognize: pdfText | chat. mapping: chat | off */
		private String provider = "pdfText";

		/** OpenAI compatible base url, e.g. http://localhost:18080/v1 */
		private String baseUrl;

		private String apiKey;

		private String model;

		private Duration timeout = Duration.ofSeconds(120);

		private Double temperature = 0.0;

		private Integer maxTokens = 1024;

		/** characters of document text sent to the model at once, that is one window */
		private Integer windowChars = 6000;

		/** lines repeated in the next window, so that a value on the border is not lost */
		private Integer overlapLines = 3;

		/** how many windows of one document are allowed: a guard against a very long document */
		private Integer maxWindows = 20;

		/** provider specific body parameters, e.g. chat_template_kwargs for llama.cpp */
		private Map<String, Object> extraBody = new LinkedHashMap<>();

	}

}
