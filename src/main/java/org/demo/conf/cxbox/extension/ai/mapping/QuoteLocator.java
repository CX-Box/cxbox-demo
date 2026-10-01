package org.demo.conf.cxbox.extension.ai.mapping;

import java.util.ArrayList;
import java.util.List;
import lombok.experimental.UtilityClass;
import org.apache.commons.lang3.StringUtils;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Box;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Line;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Span;

/**
 * Turns a value returned by the model into a frame on the document. The model is never asked for coordinates:
 * it answers with text, and the place is found in the recognized layer, so the frame always matches the document.
 * <p>
 * The search result is also the honest measure of quality: a value found in the document word for word is
 * trustworthy, a value found nowhere is a guess of the model and is shown to the person as such.
 */
@UtilityClass
public class QuoteLocator {

	public static Located locate(RecognizedDocument document, Integer lineIndex, String value) {
		if (StringUtils.isBlank(value)) {
			return new Located(null, Match.NOT_FOUND);
		}
		Line hinted = document.line(lineIndex);
		Box box = inLine(hinted, value);
		if (box != null) {
			return new Located(box, Match.EXACT);
		}
		for (Line line : document.lines()) {
			box = inLine(line, value);
			if (box != null) {
				return new Located(box, Match.OTHER_LINE);
			}
		}
		return new Located(hinted == null ? null : hinted.box(), Match.NOT_FOUND);
	}

	private static Box inLine(Line line, String value) {
		if (line == null) {
			return null;
		}
		Normalized text = Normalized.of(line.text());
		Normalized needle = Normalized.of(value);
		if (needle.value.isEmpty()) {
			return null;
		}
		int found = text.value.indexOf(needle.value);
		if (found < 0) {
			return null;
		}
		int from = text.origin.get(found);
		int to = text.origin.get(Math.min(found + needle.value.length(), text.origin.size()) - 1) + 1;
		Box box = null;
		for (Span span : line.spans()) {
			if (span.start() < to && span.end() > from) {
				box = box == null ? span.box() : box.union(span.box());
			}
		}
		return box;
	}

	/** Where the value came from. This, and not the number the model reports about itself, is the quality of the answer. */
	public enum Match {

		/** found word for word in the line the model pointed at */
		EXACT,

		/** found in the document, but in another line: the value is right, the model lost the place */
		OTHER_LINE,

		/** there is no such text in the document: the model composed the value itself */
		NOT_FOUND

	}

	public record Located(Box box, Match match) {

	}

	/** Lower case text without repeated spaces plus the position of every character in the original string. */
	private record Normalized(String value, List<Integer> origin) {

		private static Normalized of(String source) {
			StringBuilder builder = new StringBuilder();
			List<Integer> origin = new ArrayList<>();
			boolean previousSpace = true;
			for (int i = 0; i < source.length(); i++) {
				char current = Character.toLowerCase(source.charAt(i));
				boolean space = Character.isWhitespace(current);
				if (space && previousSpace) {
					continue;
				}
				builder.append(space ? ' ' : current);
				origin.add(i);
				previousSpace = space;
			}
			String trimmed = builder.toString();
			while (trimmed.endsWith(" ")) {
				trimmed = trimmed.substring(0, trimmed.length() - 1);
			}
			return new Normalized(trimmed, origin);
		}

	}

}
