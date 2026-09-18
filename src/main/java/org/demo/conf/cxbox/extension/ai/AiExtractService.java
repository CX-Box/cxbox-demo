package org.demo.conf.cxbox.extension.ai;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.cxbox.core.exception.BusinessException;
import org.cxbox.core.file.dto.FileDownloadDto;
import org.cxbox.core.file.service.CxboxFileService;
import org.demo.conf.cxbox.extension.ai.mapping.FieldMapper;
import org.demo.conf.cxbox.extension.ai.mapping.MappedField;
import org.demo.conf.cxbox.extension.ai.mapping.QuoteLocator;
import org.demo.conf.cxbox.extension.ai.mapping.QuoteLocator.Located;
import org.demo.conf.cxbox.extension.ai.mapping.QuoteLocator.Match;
import org.demo.conf.cxbox.extension.ai.mapping.MappedField.Source;
import org.demo.conf.cxbox.extension.ai.recognize.PairExtractor;
import org.demo.conf.cxbox.extension.ai.mapping.TargetField;
import org.demo.conf.cxbox.extension.ai.recognize.DocumentRecognizer;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Box;
import org.demo.conf.cxbox.extension.ai.web.AiExtractRequest;
import org.demo.conf.cxbox.extension.ai.web.AiExtractResponse;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

/**
 * Whole path of the feature: document from the file storage -> recognition -> laying out on fields -> frames
 * on the document. Two models are involved and each of them can be replaced by a property.
 */
@Slf4j
@RequiredArgsConstructor
public class AiExtractService {

	private final CxboxFileService fileService;

	private final DocumentRecognizer recognizer;

	private final PairExtractor pairExtractor;

	private final FieldMapper fieldMapper;

	private final AiProperties properties;

	@NonNull
	public AiExtractResponse extract(@NonNull AiExtractRequest request) {
		long started = System.currentTimeMillis();
		if (StringUtils.isBlank(request.fileId())) {
			throw new BusinessException().addPopup("Прикрепите документ, из которого заполнять форму");
		}
		if (!fieldMapper.available()) {
			throw new BusinessException().addPopup("Модель для распознавания не настроена: demo.ai.mapping.base-url");
		}
		FileDownloadDto file = fileService.download(request.fileId(), null);
		String fileName = StringUtils.defaultString(file.getName());
		if (!recognizer.supports(fileName, file.getType())) {
			throw new BusinessException().addPopup(
					"Пока распознаётся только pdf с текстовым слоем, для сканов нужен ocr-провайдер");
		}
		RecognizedDocument document = recognizer.recognize(read(file), fileName);
		if (document.lines().isEmpty()) {
			throw new BusinessException().addPopup("В документе нет текстового слоя, распознать нечего");
		}
		if (log.isDebugEnabled()) {
			document.lines().stream().limit(6).forEach(line -> log.debug(
					"ai: line [{}] page {} box x={} y={} w={} h={} text {}",
					line.index(), line.box().page(), line.box().x(), line.box().y(),
					line.box().width(), line.box().height(), line.text()));
		}
		// an engine that gives pairs itself is believed; for the rest they are built from the lines
		if (document.pairs().isEmpty()) {
			document = document.withPairs(pairExtractor.extract(document));
		}

		List<TargetField> targets = request.fields().stream()
				.map(field -> new TargetField(
						StringUtils.defaultIfBlank(field.id(), field.key()),
						field.key(),
						field.widget(),
						field.widgetTitle(),
						field.label(),
						field.type(),
						Boolean.TRUE.equals(field.required()),
						field.allowed(),
						field.labels(),
						field.pattern(),
						field.description()))
				.toList();
		List<MappedField> mapped = map(document, targets);

		Map<String, TargetField> byId = targets.stream()
				.collect(Collectors.toMap(TargetField::id, Function.identity(), (left, right) -> left));
		List<AiExtractResponse.Field> fields = new ArrayList<>();
		for (MappedField field : mapped) {
			TargetField target = byId.get(field.key());
			Box box = field.box();
			String match = switch (field.source()) {
				case LABEL -> "label";
				case DICTIONARY -> "dictionary";
				case TEXT -> "text";
			};
			// the search by captions, which knows nothing of the model, pointed at the same place: two signals
			double agreement = field.agreed() ? 0.2 : 0;
			// the document holds another equally suitable pair: whatever the signals say, this is one to check
			double ambiguity = field.ambiguous() ? 0.25 : 0;
			// the value is not only in the document but is also a value this very field accepts: a dictionary
			// value word for word or a value matching the pattern the project set
			double verified = verified(targets, field) ? 0.15 : 0;
			double confidence = switch (field.source()) {
				case LABEL -> 0.9 + 0.1 * field.score() - ambiguity;
				case DICTIONARY -> 0.35 + 0.2 * field.score() + agreement - ambiguity;
				case TEXT -> 0.5;
			};
			Located located = field.source() == Source.TEXT
					? QuoteLocator.locate(document, field.line(), field.value())
					: null;
			if (!accepted(target, field, document, located)) {
				log.info("ai: {} left empty: \"{}\" ({}) did not pass the check of its kind of field",
						field.key(), field.value(), field.sure());
				continue;
			}
			if (located != null) {
				box = located.box();
				match = "text";
				confidence = switch (located.match()) {
					case EXACT -> 0.75 + verified - ambiguity;
					case OTHER_LINE -> 0.55 - ambiguity;
					case NOT_FOUND -> 0.4;
				};
			}
			// the model's own word about itself: it costs nothing to ask and it is the only thing that knows
			// about the cases our checks have no opinion on
			if ("likely".equalsIgnoreCase(field.sure())) {
				confidence = Math.min(confidence, 0.7);
			}
			fields.add(new AiExtractResponse.Field(
					field.key(),
					target == null ? field.key() : target.key(),
					target == null ? null : target.widget(),
					field.value(),
					// the signals add up, and their sum has no business leaving the range a percent lives in
					Math.round(Math.max(0, Math.min(1, confidence)) * 100) / 100.0,
					match,
					field.pair(),
					field.documentValue(),
					field.alternatives(),
					box(box)
			));
		}
		List<String> filled = fields.stream().map(AiExtractResponse.Field::id).toList();
		List<String> notFound = targets.stream().map(TargetField::id).filter(id -> !filled.contains(id)).toList();

		long duration = System.currentTimeMillis() - started;
		log.info("ai: recognized {} lines and {} pairs, filled {} of {} fields in {} ms",
				document.lines().size(), document.pairs().size(), fields.size(), targets.size(), duration);
		return new AiExtractResponse(
				document.pages().stream()
						.map(page -> new AiExtractResponse.Page(page.number(), page.width(), page.height()))
						.collect(Collectors.toList()),
				fields,
				document.pairs().stream()
						.map(pair -> new AiExtractResponse.Pair(pair.index(), pair.label(), pair.value(), box(pair.box())))
						.collect(Collectors.toList()),
				notFound,
				properties.getRecognize().getProvider(),
				properties.getMapping().getModel(),
				duration
		);
	}

	/**
	 * Whether the value may be written into the field at all. "The document supports it" means different things
	 * for different kinds of field, and one rule for all of them is wrong either way: a name or an address is a
	 * quote and has to stand in the document word for word; a value of a dictionary is a choice out of a closed
	 * list and is never in the document as it is - the list itself is the whole check; a value picked from a
	 * reference book is a quote the book keeps in its own wording, so a part of it is enough.
	 * <p>
	 * What the model says about itself closes the gate for every kind alike: a value it calls a guess is not
	 * written anywhere. An empty field costs a person one entry, a plausible invention costs them the search
	 * for it.
	 */
	private boolean accepted(TargetField target, MappedField field, RecognizedDocument document, Located located) {
		if (target == null || "guess".equalsIgnoreCase(field.sure())) {
			return target != null && field.source() == Source.LABEL;
		}
		if (!target.allowed().isEmpty()) {
			// A closed list decides what the value may be, but not that the document says anything about it. The
			// support of a dictionary value is softer than a quote - the document says the same thing in its own
			// words - so it is looked for in the whole document and not in the one line the model pointed at:
			// the model is bad at pointing and good at reading.
			boolean listed = target.allowed().stream().anyMatch(item -> StringUtils.equalsIgnoreCase(item, field.value()));
			List<String> captions = new ArrayList<>(Optional.ofNullable(target.labels()).orElse(List.of()));
			captions.add(target.label());

			return listed && document.lines().stream()
					.anyMatch(line -> overlaps(line, field.value()) || captions.stream().anyMatch(caption -> overlaps(line, caption)));
		}
		if (StringUtils.isNotBlank(target.pattern())
				&& !Pattern.compile(target.pattern()).matcher(field.value()).find()) {
			return false;
		}
		if (located == null || located.match() != Match.NOT_FOUND) {
			return true;
		}

		return picked(target) && overlaps(document.line(field.line()), field.value());
	}

	/** A field whose value comes from a reference book: the document says the same thing in its own words. */
	private boolean picked(TargetField target) {
		return StringUtils.containsIgnoreCase(target.type(), "picklist") || StringUtils.containsIgnoreCase(target.type(), "suggestion");
	}

	/** The line the model pointed at and the text given speak about the same thing. */
	private boolean overlaps(RecognizedDocument.Line line, String value) {
		if (line == null || StringUtils.isBlank(value)) {
			return false;
		}
		String text = line.text().toLowerCase();
		return Arrays.stream(value.toLowerCase().split("[^\\p{L}\\p{N}]+"))
				.filter(word -> word.length() >= 4)
				.anyMatch(text::contains);
	}

	/** The value stands in the document as it stands and the field of the form accepts it as it is. */
	private boolean verified(List<TargetField> targets, MappedField field) {
		if (field.documentValue() != null) {
			return false;
		}
		TargetField target = targets.stream().filter(item -> item.id().equals(field.key())).findFirst().orElse(null);
		if (target == null) {
			return false;
		}
		if (!target.allowed().isEmpty()) {
			return target.allowed().stream().anyMatch(item -> StringUtils.equalsIgnoreCase(item, field.value()));
		}

		return StringUtils.isNotBlank(target.pattern()) && Pattern.compile(target.pattern()).matcher(field.value()).find();
	}

	private AiExtractResponse.Box box(Box box) {
		return box == null ? null : new AiExtractResponse.Box(box.page(), box.x(), box.y(), box.width(), box.height());
	}

	/**
	 * A failure of the model is a normal answer for the person, not a five hundred: it says what happened and
	 * what to do about it.
	 */
	private List<MappedField> map(RecognizedDocument document, List<TargetField> targets) {
		try {
			return fieldMapper.map(document, targets);
		} catch (RestClientResponseException e) {
			String answer = e.getResponseBodyAsString();
			log.error("ai: model refused: {}", StringUtils.abbreviate(answer, 1000));
			if (StringUtils.contains(answer, "exceed_context_size")) {
				throw new BusinessException().addPopup(
						"Документ слишком большой для модели. Уменьшите документ или увеличьте контекст модели");
			}
			throw new BusinessException().addPopup("Модель не смогла обработать документ, подробности в логе сервера");
		} catch (ResourceAccessException e) {
			log.error("ai: model is not reachable", e);
			throw new BusinessException().addPopup("Модель не отвечает: " + properties.getMapping().getBaseUrl());
		}
	}

	@SneakyThrows
	private byte[] read(FileDownloadDto file) {
		try (InputStream content = Optional.ofNullable(file.getContent()).orElseThrow().get()) {
			return content.readAllBytes();
		} catch (IOException e) {
			throw new BusinessException().addPopup("Не удалось прочитать документ: " + e.getMessage());
		}
	}

}
