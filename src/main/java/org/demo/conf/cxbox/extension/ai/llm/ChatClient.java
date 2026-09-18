package org.demo.conf.cxbox.extension.ai.llm;

import lombok.NonNull;

/**
 * Single entry point to any chat model with an OpenAI compatible api: local llama.cpp, GigaChat, YandexGPT,
 * a vision model doing ocr. Adapting another vendor means implementing this interface, nothing else.
 */
public interface ChatClient {

	boolean available();

	/**
	 * @param jsonSchema json schema of the expected answer, null for free text. Servers that support it
	 * constrain generation by the schema, which is what makes a small model usable.
	 */
	@NonNull
	String complete(@NonNull String system, @NonNull String user, String jsonSchema);

}
