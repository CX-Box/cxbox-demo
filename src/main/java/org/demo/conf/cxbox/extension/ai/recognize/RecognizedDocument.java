package org.demo.conf.cxbox.extension.ai.recognize;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Result of recognition, independent of who produced it: pdf text layer, ocr service or a vision model.
 * All coordinates are relative to the page (0..1, origin in the top left corner), so the front draws them
 * without knowing the original size of the document.
 * <p>
 * Two levels at once, and this is the whole point of the common denominator. {@code lines} is what every
 * engine can give: text with coordinates. {@code pairs} is "caption - value", which document engines give
 * themselves; for an engine that cannot, the pairs are built from the lines. Where there are pairs, the model
 * only chooses a pair for a field and cannot compose a value at all.
 */
public record RecognizedDocument(List<Page> pages, List<Line> lines, List<Pair> pairs, boolean pairsFromEngine) {

	public static RecognizedDocument empty() {
		return new RecognizedDocument(List.of(), List.of(), List.of(), false);
	}

	/** Pairs built by us out of the lines: the model is not shown them, it has the same lines in front of it. */
	public RecognizedDocument withPairs(List<Pair> pairs) {
		return new RecognizedDocument(pages, lines, pairs, false);
	}

	/**
	 * Text for the model: one line per line of the document, numbered, so the answer can point at a line, and
	 * with the place of the line on the page. Coordinates are what tells a caption from its value in a table,
	 * "Сторона-1" from "Сторона-2" in a contract and one column of a form from another: without them a
	 * document is a heap of sentences, with them it keeps the shape a person sees.
	 */
	public static String numberedText(List<Line> lines) {
		return lines.stream()
				.map(line -> "[" + line.index() + "] с" + line.box().page()
						+ " y=" + percent(line.box().y()) + " x=" + percent(line.box().x())
						+ (line.confidence() == null ? "" : " q=" + line.confidence())
						+ " " + line.text())
				.collect(Collectors.joining("\n"));
	}

	private static int percent(double share) {
		return (int) Math.round(share * 100);
	}

	/**
	 * Cuts the document into windows that fit the model. A long document is never trimmed to its first window:
	 * windows go one after another until every field is filled. Neighbours overlap by a few lines, so a value
	 * that the cut went through is still whole in one of them.
	 */
	public List<List<Line>> windows(int windowChars, int overlapLines) {
		List<List<Line>> windows = new ArrayList<>();
		List<Line> current = new ArrayList<>();
		int length = 0;
		for (Line line : lines) {
			int lineLength = line.text().length() + 8;
			if (!current.isEmpty() && length + lineLength > windowChars) {
				windows.add(List.copyOf(current));
				current = new ArrayList<>(current.subList(Math.max(0, current.size() - overlapLines), current.size()));
				length = current.stream().mapToInt(item -> item.text().length() + 8).sum();
			}
			current.add(line);
			length += lineLength;
		}
		if (!current.isEmpty()) {
			windows.add(List.copyOf(current));
		}
		return windows;
	}

	public Line line(Integer index) {
		return index == null ? null : lines.stream().filter(l -> l.index() == index).findFirst().orElse(null);
	}

	public record Page(int number, double width, double height) {

	}

	/** Position of a piece of text on a page, share of the page side. */
	public record Box(int page, double x, double y, double width, double height) {

		public Box union(Box other) {
			double left = Math.min(x, other.x);
			double top = Math.min(y, other.y);
			double right = Math.max(x + width, other.x + other.width);
			double bottom = Math.max(y + height, other.y + other.height);
			return new Box(page, left, top, right - left, bottom - top);
		}

	}

	/**
	 * Line of the document. {@code spans} keep the position of every character, that is how a box is built
	 * around the value itself and not around the whole line.
	 */
	public record Line(int index, int page, String text, Box box, List<Span> spans, Double confidence) {

	}

	public record Span(int start, int end, Box box) {

	}

	/**
	 * Pair "caption - value" from the document: "Юридический адрес: 127015, г. Москва". The value is a piece
	 * of the document with a known place on the page, so the model has nothing to compose and the frame around
	 * the value is exact.
	 *
	 * @param index number the model answers with instead of retyping the value
	 * @param confidence what the engine thinks of this pair, null if it does not say
	 */
	public record Pair(int index, String label, String value, Box box, Integer line, Double confidence) {

	}

}
