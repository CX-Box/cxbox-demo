package org.demo.conf.cxbox.extension.ai.recognize;

import lombok.NonNull;

/**
 * First of two models: turns a document into text with coordinates. Implementations: pdf text layer (free and
 * instant), external ocr service, vision model. The rest of the feature does not know which one is in use.
 */
public interface DocumentRecognizer {

	boolean supports(@NonNull String fileName, String contentType);

	@NonNull
	RecognizedDocument recognize(byte @NonNull [] content, @NonNull String fileName);

}
