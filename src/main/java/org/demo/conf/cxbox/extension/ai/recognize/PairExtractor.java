package org.demo.conf.cxbox.extension.ai.recognize;

import java.util.ArrayList;
import java.util.List;
import lombok.NonNull;
import org.apache.commons.lang3.StringUtils;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Box;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Line;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Pair;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Span;

/**
 * Builds pairs "caption - value" out of lines, for engines that give text only.
 * <p>
 * This is a fallback, not a recognition engine of our own: a document engine gives its own pairs and they are
 * taken as is. Two ways a document says "this is a caption and this is its value" are covered here: a colon
 * ("Адрес: 127015, г. Москва") and a wide gap between columns of a table.
 */
public class PairExtractor {

	private static final int MAX_LABEL_LENGTH = 80;

	private static final int MAX_VALUE_LENGTH = 300;

	/** fewer letters than this is not a caption but a number of a row or a mark of a column */
	private static final int MIN_LABEL_LETTERS = 3;

	/** a gap this many times wider than an average character means a column boundary, not a space */
	private static final double COLUMN_GAP = 2.5;

	@NonNull
	public List<Pair> extract(@NonNull RecognizedDocument document) {
		List<Pair> pairs = new ArrayList<>();
		for (Line line : document.lines()) {
			int split = splitPoint(line);
			if (split < 0) {
				continue;
			}
			String label = clean(line.text().substring(0, split));
			int valueStart = valueStart(line.text(), split);
			String value = clean(line.text().substring(valueStart));
			if (!suitable(label, value)) {
				continue;
			}
			Box box = box(line, valueStart);
			if (box != null) {
				pairs.add(new Pair(pairs.size() + 1, label, value, box, line.index(), null));
			}
		}
		return pairs;
	}

	/** Position the caption ends at: a colon, or the widest gap between columns. */
	private int splitPoint(Line line) {
		int colon = line.text().indexOf(':');
		if (colon > 0 && colon < MAX_LABEL_LENGTH) {
			return colon;
		}
		return columnGap(line);
	}

	/**
	 * A caption and its value are two columns, so exactly one wide gap in the line. Three columns and more is
	 * a row of a table: there is no caption there, and a row of a specification has nothing to do with a field
	 * of the form.
	 */
	private int columnGap(Line line) {
		List<Span> spans = line.spans();
		if (spans.size() < 4) {
			return -1;
		}
		double averageWidth = spans.stream().mapToDouble(span -> span.box().width()).average().orElse(0);
		if (averageWidth <= 0) {
			return -1;
		}
		int split = -1;
		int gaps = 0;
		for (int i = 1; i < spans.size(); i++) {
			Box previous = spans.get(i - 1).box();
			Box current = spans.get(i).box();
			boolean sameRow = Math.abs(current.y() - previous.y()) < previous.height();
			double gap = current.x() - (previous.x() + previous.width());
			if (sameRow && gap > averageWidth * COLUMN_GAP) {
				gaps++;
				if (split < 0) {
					split = spans.get(i - 1).end();
				}
			}
		}
		return gaps == 1 ? split : -1;
	}

	private int valueStart(String text, int split) {
		int start = text.charAt(split) == ':' ? split + 1 : split;
		while (start < text.length() && Character.isWhitespace(text.charAt(start))) {
			start++;
		}
		return start;
	}

	/** A caption is words, not a number of a row and not a column of figures. */
	private boolean suitable(String label, String value) {
		return StringUtils.isNotBlank(label)
				&& StringUtils.isNotBlank(value)
				&& label.length() <= MAX_LABEL_LENGTH
				&& value.length() <= MAX_VALUE_LENGTH
				&& label.chars().filter(Character::isLetter).count() >= MIN_LABEL_LETTERS;
	}

	/** Frame of the value itself: only the characters after the caption. */
	private Box box(Line line, int from) {
		Box box = null;
		for (Span span : line.spans()) {
			if (span.end() > from) {
				box = box == null ? span.box() : box.union(span.box());
			}
		}
		return box;
	}

	private String clean(String text) {
		return StringUtils.strip(text, " \t .:;-–—");
	}

}
