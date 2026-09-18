package org.demo.conf.cxbox.extension.ai.recognize;

import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import java.util.List;
import lombok.NonNull;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Box;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Line;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Page;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Span;

/**
 * Reads the text layer of a pdf together with the position of every character. Works for documents produced
 * electronically; a scan has no text layer and needs an ocr provider.
 */
@Slf4j
public class PdfTextLayerRecognizer implements DocumentRecognizer {

	@Override
	public boolean supports(@NonNull String fileName, String contentType) {
		return StringUtils.endsWithIgnoreCase(fileName, ".pdf")
				|| StringUtils.containsIgnoreCase(contentType, "pdf");
	}

	@Override
	@SneakyThrows
	@NonNull
	public RecognizedDocument recognize(byte @NonNull [] content, @NonNull String fileName) {
		try (PDDocument document = PDDocument.load(content)) {
			LineStripper stripper = new LineStripper();
			stripper.setSortByPosition(true);
			stripper.setStartPage(1);
			stripper.setEndPage(document.getNumberOfPages());
			stripper.writeText(document, Writer.nullWriter());
			// the text layer gives lines only, the pairs are built out of them later
			return new RecognizedDocument(stripper.pages, stripper.lines, List.of(), false);
		}
	}

	private static class LineStripper extends PDFTextStripper {

		private final List<Page> pages = new ArrayList<>();

		private final List<Line> lines = new ArrayList<>();

		private final StringBuilder lineText = new StringBuilder();

		private final List<Span> lineSpans = new ArrayList<>();

		private LineStripper() throws IOException {
			super();
		}

		@Override
		protected void startPage(PDPage page) throws IOException {
			PDRectangle mediaBox = page.getMediaBox();
			boolean turned = page.getRotation() == 90 || page.getRotation() == 270;
			pages.add(new Page(
					getCurrentPageNo(),
					turned ? mediaBox.getHeight() : mediaBox.getWidth(),
					turned ? mediaBox.getWidth() : mediaBox.getHeight()
			));
			super.startPage(page);
		}

		@Override
		protected void writeString(String text, List<TextPosition> textPositions) {
			Page page = pages.get(pages.size() - 1);
			for (TextPosition position : textPositions) {
				String unicode = position.getUnicode();
				if (StringUtils.isEmpty(unicode)) {
					continue;
				}
				int start = lineText.length();
				lineText.append(unicode);
				lineSpans.add(new Span(start, lineText.length(), new Box(
						page.number(),
						position.getXDirAdj() / page.width(),
						(position.getYDirAdj() - position.getHeightDir()) / page.height(),
						position.getWidthDirAdj() / page.width(),
						position.getHeightDir() / page.height()
				)));
			}
		}

		@Override
		protected void writeWordSeparator() {
			lineText.append(getWordSeparator());
		}

		@Override
		protected void writeLineSeparator() {
			flushLine();
		}

		@Override
		protected void endPage(PDPage page) throws IOException {
			flushLine();
			super.endPage(page);
		}

		private void flushLine() {
			String text = lineText.toString().trim();
			if (!text.isEmpty() && !lineSpans.isEmpty()) {
				Box box = lineSpans.stream().map(Span::box).reduce(Box::union).orElse(null);
				lines.add(new Line(lines.size() + 1, box.page(), lineText.toString(), box, List.copyOf(lineSpans), null));
			}
			lineText.setLength(0);
			lineSpans.clear();
		}

	}

}
