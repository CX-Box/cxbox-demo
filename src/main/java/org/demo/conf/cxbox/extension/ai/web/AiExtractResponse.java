package org.demo.conf.cxbox.extension.ai.web;

import java.util.List;

/**
 * Suggestion for the form: a value per field and the place in the document it came from. Nothing is saved,
 * the person applies the values.
 *
 * @param pairs everything the document was understood to hold, not only what was laid out on the form: a
 * person who sees a wrong guess takes any other pair and binds it to the field by hand
 */
public record AiExtractResponse(
		List<Page> pages,
		List<Field> fields,
		List<Pair> pairs,
		List<String> notFound,
		String recognizer,
		String model,
		long durationMs) {

	public record Page(int number, double width, double height) {

	}

	/**
	 * @param confidence 0..1, counted by the platform, not reported by the model
	 * @param match label | pair | dictionary | text | guess, the reason of the confidence, shown as a hint
	 * @param pair number of the pair the value came from, empty when the value was read from plain text
	 * @param documentValue what the document says when the value of the field is not that text word for word
	 * @param alternatives other pairs that suit this field, so a wrong guess is corrected in one click
	 */
	public record Field(
			String id,
			String key,
			String widget,
			String value,
			double confidence,
			String match,
			Integer pair,
			String documentValue,
			List<Integer> alternatives,
			Box box) {

	}

	/** Pair "caption - value" of the document; {@code box} is empty if the engine gives no coordinates. */
	public record Pair(int index, String label, String value, Box box) {

	}

	/** Share of the page side, origin in the top left corner. */
	public record Box(int page, double x, double y, double width, double height) {

	}

}
