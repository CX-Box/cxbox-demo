package org.demo.conf.cxbox.extension.ai.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.util.DefaultIndenter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.demo.conf.cxbox.extension.ai.AiProperties;
import org.demo.conf.cxbox.extension.ai.llm.ChatClient;
import org.demo.conf.cxbox.extension.ai.mapping.MappedField.Source;
import org.demo.conf.cxbox.extension.ai.mapping.PairScorer.Scored;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Line;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Pair;
import org.springframework.web.client.RestClientResponseException;

/**
 * Lays the recognized document out on the fields of the form. Nothing here is written for a particular widget
 * or a particular document: a field is described by its metadata, a document by its lines with their places on
 * the page.
 * <ol>
 * <li>The model gets every field of the form and the whole document and answers with the number of the line a
 * value stands on and the value itself. Nothing is picked out for it in advance: a choice made before the model
 * is a choice made without the document in front of it. A document too big for one request is read window by
 * window until every field is filled.</li>
 * <li>The answer is checked, not believed: the value is looked for in the very line the model named, and that
 * is what the frame on the document and the percent shown to the person are built from.</li>
 * <li>A caption the project wrote down for a field in the json of the widget is applied after the model and
 * wins over it; a field the model said nothing about is filled by a caption of the document that plainly says
 * what it is.</li>
 * </ol>
 * A field nothing supports is left empty on purpose: an empty field the person fills in is better than a
 * plausible value nobody checks.
 */
@Slf4j
@RequiredArgsConstructor
public class LlmFieldMapper implements FieldMapper {

	/** how many candidates of one field are scored and offered as alternatives to the person */
	private static final int CANDIDATES = 20;

	/**
	 * What the model is told about the work itself. The rules a form is filled by stand here and nowhere else:
	 * what counts as a value, what to do when there is none, and how sure the model has to say it is. Not one of
	 * them is repeated in the code afterwards - a rule kept in two places is a rule that gets two answers.
	 */
	private static final String SYSTEM_RULES = """
			Ты заполняешь поля формы приложения по распознанному документу.

			КАК ДАН ДОКУМЕНТ
			Каждая строка документа записана так:
			[12] с1 y=36 x=8 Место нахождения Стороны-2: 127015, г. Москва
			12 — номер строки, им ты ссылаешься на строку в ответе; с1 — номер страницы;
			y — высота строки от верха страницы в процентах; x — отступ слева в процентах;
			если распознавание оценило свою уверенность, после координат стоит q=0.87.
			Координаты показывают разметку документа: подпись и её значение стоят на одной высоте y
			либо значение идёт следующей строкой ниже; одинаковый x у нескольких строк подряд — это колонка таблицы.

			КАК ДАНА ФОРМА
			Форма дана как json виджетов приложения, как они описаны в самом приложении. У поля есть:
			id — им ты отвечаешь про это поле; key и label — как поле называется в приложении; type — тип поля;
			required — обязательное ли оно; allowed — полный список допустимых значений, если поле справочное;
			labels — подписи, под которыми это поле стоит в документах проекта; description — уточнение проекта.
			Виджетов может быть несколько: «Заявитель» и «Ответчик». Поля разных виджетов относятся к разным
			лицам, и путать их нельзя.

			ЧТО СДЕЛАТЬ
			1. Пройди по всем полям формы. Для каждого реши, есть ли его значение в этом документе.
			2. Если значения нет — пропусти поле, не включай его в ответ. Не придумывай его и не бери похожее.
			Форма и документ — разные вещи: в форме всегда есть поля, которых в документе нет, и ответ без них правильный.
			Пустое поле лучше правдоподобной выдумки: человеку дешевле дописать, чем найти и исправить ошибку.
			3. Если значение есть — укажи номер строки, в которой оно стоит, и само значение слово в слово из этой строки.
			4. Значение — это то, что стоит после двоеточия или правее подписи на той же высоте. Сама подпись значением не является.
			5. Одно значение заполняет одно поле. Если ты уже отдал значение одному полю, другому его не давай:
			одинаковое значение у двух разных полей формы означает, что одно из них ты угадал.
			6. Для справочного поля выбери одно из допустимых значений, даже если в документе написано другими словами.
			Номером строки укажи ту строку, из которой это следует.
			7. В документе бывает несколько похожих значений: адрес поставщика и адрес покупателя, два ИНН, две даты.
			Сначала определи по документу, о каком лице идёт речь в форме, и дальше бери значения только этого лица.
			8. Для каждого поля скажи, насколько ты уверен, в поле sure:
			exact — значение написано в документе прямо, ты просто его переписал;
			likely — значение следует из документа, но сказано другими словами: выбор из списка допустимых значений,
			пересчёт формата, сокращение;
			guess — ты не уверен. Значение с guess мы не поставим в форму, и это правильно: лучше пустое поле.""";

	private static final String SYSTEM_ANSWER = """

			В ответе только json по заданной схеме, без пояснений.""";

	private static final String SYSTEM_LINES = SYSTEM_RULES + SYSTEM_ANSWER;

	/** the same work, with what the recognition engine itself parsed into "caption = value" added to it */
	private static final String SYSTEM_LINES_PAIRS = SYSTEM_RULES + """


			ГОТОВЫЕ СОПОСТАВЛЕНИЯ
			Движок распознавания сам разобрал часть документа на «подпись = значение» и, если умеет, указал качество.
			Это подсказка, а не истина: разбор бывает неполным и бывает неверным.
			9. Если готовое сопоставление подходит полю — бери его значение и укажи номер строки, в которой оно стоит.
			10. Если подходящего сопоставления нет или оно сомнительное — разбирай строки документа сам.""" + SYSTEM_ANSWER;

	private final ChatClient chatClient;

	private final AiProperties.Endpoint endpoint;

	private final ObjectMapper objectMapper;

	@Override
	public boolean available() {
		return chatClient.available();
	}

	@Override
	@NonNull
	public List<MappedField> map(@NonNull RecognizedDocument document, @NonNull List<TargetField> fields) {
		if (fields.isEmpty() || document.lines().isEmpty()) {
			return List.of();
		}
		// the caption of the form against the captions of the document, word by word. No model takes part in it,
		// so this is the signal the answer of the model is checked by afterwards, and the source of the other
		// variants a person switches a field to in one click
		Map<String, List<Scored>> plain = scored(fields, document);
		Map<String, MappedField> found = new LinkedHashMap<>();

		// the model is not helped and not limited: it gets every field of the form and the whole document, and
		// decides itself. Nothing is decided for it in advance, because a decision made in advance is a decision
		// made without the document in front of it. A document too big for one request is read window by window,
		// and that is the only thing that changes for it.
		byText(document, fields, found, plain);

		// a caption the project itself wrote down for a field is not a hint but a rule, and it is applied after
		// the model, not instead of it: what the model chose stays in the alternatives
		byNamed(fields, plain, found);
		// the caption of the document says it plainly and the model said nothing: the field is filled anyway
		byLabel(missing(fields, found), plain, found);

		log.info("ai: filled {} of {} fields: by caption {}, by the model {}",
				found.size(), fields.size(), count(found, Source.LABEL),
				count(found, Source.TEXT) + count(found, Source.DICTIONARY));

		return List.copyOf(found.values());
	}

	/**
	 * How well every pair of the document suits every field, counted without any model: this is what the answer
	 * of the model is checked against, where the other variants of a field come from, and what fills a field the
	 * model said nothing about.
	 */
	private Map<String, List<Scored>> scored(List<TargetField> fields, RecognizedDocument document) {
		Map<String, List<Scored>> candidates = fields.stream().collect(Collectors.toMap(
				TargetField::id,
				field -> PairScorer.candidates(field, document.pairs(), CANDIDATES, null),
				(left, right) -> left,
				LinkedHashMap::new
		));
		if (log.isDebugEnabled()) {
			// why a field took this very pair and not another one: the whole answer of the feature hangs on it
			candidates.forEach((key, scored) -> log.debug("ai: candidates of {}: {}", key,
					scored.stream().limit(5).map(item -> item.pair().index() + " " + item.pair().label()
							+ " = " + Math.round(item.score() * 100) / 100.0).toList()));
		}

		return candidates;
	}

	private long count(Map<String, MappedField> found, Source source) {
		return found.values().stream().filter(field -> field.source() == source).count();
	}

	private List<TargetField> missing(List<TargetField> fields, Map<String, MappedField> found) {
		return fields.stream().filter(field -> !found.containsKey(field.id())).toList();
	}

	/**
	 * The caption the project itself wrote down for this field in the json of the widget stands in the document
	 * word for word. This is not a guess and not a hint of a model: the project said "our documents call this
	 * field so", so such a pair wins over whatever the model answered, and the answer of the model stays in the
	 * alternatives next to it.
	 */
	private void byNamed(List<TargetField> fields, Map<String, List<Scored>> candidates, Map<String, MappedField> found) {
		for (TargetField field : fields) {
			List<Scored> scored = candidates.get(field.id());
			Scored named = scored.isEmpty() ? null : named(field, scored);
			if (named == null) {
				continue;
			}
			String value = field.dictionary() ? exact(field, named.pair().value()) : named.pair().value();
			if (value != null) {
				found.put(field.id(), of(field, named, value, Source.LABEL, null, scored, scored));
			}
		}
	}

	/**
	 * One candidate is clearly better than all the rest: the caption of the document says what the field is
	 * called, and says it alone. Used for what the model left empty.
	 */
	private void byLabel(List<TargetField> fields, Map<String, List<Scored>> candidates, Map<String, MappedField> found) {
		for (TargetField field : fields) {
			List<Scored> scored = candidates.get(field.id());
			if (scored.isEmpty()) {
				continue;
			}
			double second = scored.size() > 1 ? scored.get(1).score() : 0;
			if (scored.get(0).score() < PairScorer.SURE_SCORE || scored.get(0).score() - second < PairScorer.SURE_GAP) {
				continue;
			}
			String value = field.dictionary() ? exact(field, scored.get(0).pair().value()) : scored.get(0).pair().value();
			if (value != null) {
				found.put(field.id(), of(field, scored.get(0), value, Source.LABEL, null, scored, scored));
			}
		}
	}

	/**
	 * @param scored candidates of this field, best first: the second best of them is what makes the value one to
	 * check, and the rest of them is what a wrong guess is corrected by in one click
	 * @param independent the same candidates ranked without the caption the model gave: when its best is the
	 * very pair the model chose, two signals that know nothing of each other said the same thing
	 */
	private MappedField of(TargetField field, Scored chosen, String value, Source source, String documentValue,
			List<Scored> scored, List<Scored> independent) {
		return new MappedField(
				field.id(),
				value,
				// a match by the captions the project itself named: this one is not the model's guess at all
				"exact",
				chosen.pair().line(),
				chosen.pair().box(),
				chosen.pair().index(),
				source,
				independent.stream()
						.filter(item -> item.pair().index() == chosen.pair().index())
						.mapToDouble(Scored::score)
						.findFirst()
						.orElse(0),
				agreed(independent, chosen),
				ambiguous(scored),
				documentValue,
				// only the pairs that really suit the field: a phone number offered instead of a company name is
				// noise, and noise in the list of variants costs the person more time than an empty list
				scored.stream()
						.filter(item -> item.score() >= PairScorer.EVIDENCE)
						.map(item -> item.pair().index())
						.filter(index -> index != chosen.pair().index())
						.limit(4)
						.toList()
		);
	}

	/** The pair whose caption the project itself wrote down for this field in the json of the widget. */
	private Scored named(TargetField field, List<Scored> scored) {
		if (field.labels() == null || field.labels().isEmpty()) {
			return null;
		}

		return scored.stream()
				.filter(item -> field.labels().stream().anyMatch(label -> same(label, item.pair().label())))
				.findFirst()
				.orElse(null);
	}

	/** Captions are the same when only case and punctuation tell them apart. */
	private boolean same(String left, String right) {
		return StringUtils.equalsIgnoreCase(simplified(left), simplified(right));
	}

	private String simplified(String text) {
		return StringUtils.trimToEmpty(text).replaceAll("[^\\p{L}\\p{N}]+", " ").trim();
	}

	/**
	 * The caption of the field is close to the caption of the pair by itself, and the model chose that very
	 * pair: two signals that know nothing of each other said the same thing. When every pair suits the field
	 * alike, which is what happens to a form and a document written in different languages, the first of them
	 * is first by chance and confirms nothing.
	 */
	private boolean agreed(List<Scored> independent, Scored chosen) {
		return !independent.isEmpty()
				&& independent.get(0).pair().index() == chosen.pair().index()
				&& independent.get(0).score() >= PairScorer.EVIDENCE
				&& (independent.size() < 2 || independent.get(0).score() - independent.get(1).score() >= 0.05);
	}

	/** The document holds another pair that suits the field just as well, as a contract holds an address of every side. */
	private boolean ambiguous(List<Scored> scored) {
		return scored.size() > 1
				&& scored.get(0).score() >= PairScorer.EVIDENCE
				&& Math.abs(scored.get(0).score() - scored.get(1).score()) < 0.05;
	}

	/**
	 * Lines of the document with their places on the page, window by window. The model answers with the number
	 * of the line and the value it reads there, and the value is looked for in that very line afterwards: a
	 * value that is not there is a guess of the model and is shown to the person as one.
	 */
	private void byText(RecognizedDocument document, List<TargetField> fields, Map<String, MappedField> found,
			Map<String, List<Scored>> candidates) {
		if (fields.isEmpty()) {
			return;
		}
		Deque<List<Line>> windows = new ArrayDeque<>(document.windows(endpoint.getWindowChars(), endpoint.getOverlapLines()));
		int requests = 0;
		while (!windows.isEmpty() && requests < endpoint.getMaxWindows()) {
			List<TargetField> stillMissing = missing(fields, found);
			if (stillMissing.isEmpty()) {
				return;
			}
			List<Line> window = windows.poll();
			requests++;
			try {
				String answer = ask(
						document.pairsFromEngine() ? SYSTEM_LINES_PAIRS : SYSTEM_LINES,
						textPrompt(document, window, stillMissing),
						textSchema(stillMissing, window));
				parseText(answer, stillMissing, document, candidates)
						.forEach(field -> found.putIfAbsent(field.key(), field));
			} catch (RestClientResponseException e) {
				if (!contextOverflow(e) || window.size() < 2) {
					throw e;
				}
				int middle = window.size() / 2;
				windows.addFirst(List.copyOf(window.subList(middle, window.size())));
				windows.addFirst(List.copyOf(window.subList(0, middle)));
				log.info("ai: window of {} lines did not fit the model, split in two", window.size());
			}
		}
		if (!windows.isEmpty()) {
			log.warn("ai: stopped after {} requests, {} windows of the document left unread", requests, windows.size());
		}
	}

	private String ask(String system, String user, String schema) {
		try {
			log.info("ai: prompt >>> {}", user.replace('\n', '|'));
			String answer = chatClient.complete(system, user, schema);
			log.debug("ai: answer >>> {}", StringUtils.abbreviate(answer.replace('\n', ' '), 1500));

			return answer;
		} catch (RestClientResponseException e) {
			if (contextOverflow(e)) {
				log.warn("ai: the list of candidates did not fit the model");

				return "";
			}
			throw e;
		}
	}

	private boolean contextOverflow(RestClientResponseException e) {
		return StringUtils.contains(e.getResponseBodyAsString(), "exceed_context_size");
	}

	/**
	 * The form as the project wrote it: the json of its widgets with the fields as they are, plus what the row
	 * meta of the platform knows about them. Nothing is reshaped and nothing is thrown away - a form retold in
	 * our own words is a form we have already interpreted for the model.
	 */
	@SneakyThrows
	private String form(List<TargetField> fields) {
		ArrayNode widgets = objectMapper.createArrayNode();
		Map<String, List<TargetField>> byWidget = fields.stream().collect(Collectors.groupingBy(
				field -> StringUtils.defaultString(field.widget()),
				LinkedHashMap::new,
				Collectors.toList()
		));
		byWidget.forEach((widget, widgetFields) -> {
			ObjectNode node = widgets.addObject();
			node.put("name", widget);
			if (StringUtils.isNotBlank(widgetFields.get(0).widgetTitle())) {
				node.put("title", widgetFields.get(0).widgetTitle());
			}
			ArrayNode items = node.putArray("fields");
			widgetFields.forEach(field -> {
				ObjectNode item = items.addObject();
				item.put("id", field.id());
				item.put("key", field.key());
				item.put("label", StringUtils.defaultIfBlank(field.label(), field.key()));
				item.put("type", field.type());
				if (field.required()) {
					item.put("required", true);
				}
				if (field.dictionary()) {
					ArrayNode allowed = item.putArray("allowed");
					field.allowed().forEach(allowed::add);
				}
				if (field.labels() != null && !field.labels().isEmpty()) {
					ArrayNode labels = item.putArray("labels");
					field.labels().forEach(labels::add);
				}
				if (StringUtils.isNotBlank(field.pattern())) {
					item.put("pattern", field.pattern());
				}
				if (StringUtils.isNotBlank(field.description())) {
					item.put("description", field.description());
				}
			});
		});

		// line feeds of one kind whatever the operating system: the prompt must look the same everywhere
		DefaultIndenter indenter = new DefaultIndenter("  ", "\n");
		DefaultPrettyPrinter printer = new DefaultPrettyPrinter();
		printer.indentObjectsWith(indenter);
		printer.indentArraysWith(indenter);

		return objectMapper.writer(printer).writeValueAsString(widgets);
	}

	/**
	 * Everything the recognition gave and everything the form asks for. The pairs of the engine are put in only
	 * when the engine itself matched them: pairs we built out of the same lines tell the model nothing it does
	 * not already see, and a hint that is really a guess of ours makes the answer worse, not better.
	 */
	private String textPrompt(RecognizedDocument document, List<Line> window, List<TargetField> fields) {
		StringBuilder prompt = new StringBuilder("ДОКУМЕНТ:\n").append(RecognizedDocument.numberedText(window));
		if (document.pairsFromEngine() && !document.pairs().isEmpty()) {
			prompt.append("\n\nГОТОВЫЕ СОПОСТАВЛЕНИЯ ОТ РАСПОЗНАВАНИЯ:\n").append(document.pairs().stream()
					.map(pair -> pair.label() + " = " + pair.value()
							+ (pair.line() == null ? "" : " | строка " + pair.line())
							+ (pair.confidence() == null ? "" : " | качество " + pair.confidence()))
					.collect(Collectors.joining("\n")));
		}

		return prompt.append("\n\nФОРМА:\n").append(form(fields)).toString();
	}

	@SneakyThrows
	private String textSchema(List<TargetField> fields, List<Line> window) {
		ArrayNode variants = objectMapper.createArrayNode();
		for (TargetField field : fields) {
			ObjectNode properties = objectMapper.createObjectNode();
			properties.set("key", objectMapper.createObjectNode().put("const", field.id()));
			ObjectNode value = objectMapper.createObjectNode().put("type", "string");
			if (field.dictionary()) {
				ArrayNode allowed = value.putArray("enum");
				field.allowed().forEach(allowed::add);
			}
			properties.set("value", value);
			// a line of this very window and nothing else: the place of the value is not something to invent
			ObjectNode line = objectMapper.createObjectNode();
			ArrayNode numbers = line.putArray("enum");
			window.forEach(item -> numbers.add(item.index()));
			properties.set("line", line);
			// how sure the model itself is. Asking it is honest and cheap; deciding for it by searching the
			// document for its answer is neither
			ObjectNode sure = objectMapper.createObjectNode();
			ArrayNode steps = sure.putArray("enum");
			steps.add("exact").add("likely").add("guess");
			properties.set("sure", sure);
			variants.add(variant(properties, List.of("key", "value", "line", "sure")));
		}

		return schema(variants, fields.size());
	}

	private ObjectNode variant(ObjectNode properties, List<String> required) {
		ObjectNode variant = objectMapper.createObjectNode();
		variant.put("type", "object");
		variant.set("properties", properties);
		variant.set("required", objectMapper.valueToTree(required));
		variant.put("additionalProperties", false);

		return variant;
	}

	@SneakyThrows
	private String schema(ArrayNode variants, int maxItems) {
		ObjectNode items = objectMapper.createObjectNode();
		items.set("anyOf", variants);
		ObjectNode array = objectMapper.createObjectNode();
		array.put("type", "array");
		array.set("items", items);
		array.put("maxItems", maxItems);
		ObjectNode schema = objectMapper.createObjectNode();
		schema.put("type", "object");
		schema.set("properties", objectMapper.createObjectNode().set("fields", array));
		schema.set("required", objectMapper.valueToTree(List.of("fields")));
		schema.put("additionalProperties", false);

		return objectMapper.writeValueAsString(schema);
	}

	private List<MappedField> parseText(String answer, List<TargetField> fields, RecognizedDocument document,
			Map<String, List<Scored>> candidates) {
		Map<String, TargetField> byKey = fields.stream().collect(Collectors.toMap(TargetField::id, Function.identity()));
		List<MappedField> result = new ArrayList<>();
		for (JsonNode node : answered(answer)) {
			TargetField field = byKey.get(node.path("key").asText(null));
			String value = StringUtils.trimToNull(node.path("value").asText(null));
			if (field == null || value == null) {
				continue;
			}
			String checked = field.dictionary() ? allowed(field, value) : value;
			if (checked == null) {
				continue;
			}
			Integer line = node.hasNonNull("line") ? node.get("line").asInt() : null;
			String sure = node.path("sure").asText("likely");
			// the line the value was read from usually is a pair as well: then the frame, the alternatives and
			// the manual rebinding work the same way they work for a value the model picked out of the pairs
			Pair named = document.pairs().stream()
					.filter(item -> line != null && line.equals(item.line()))
					.findFirst()
					.orElse(null);
			List<Scored> scored = candidates.getOrDefault(field.id(), List.of());
			List<Scored> independent = candidates.getOrDefault(field.id(), List.of());
			double support = named == null ? 0 : independent.stream()
					.filter(item -> item.pair().index() == named.index())
					.mapToDouble(Scored::score)
					.findFirst()
					.orElse(0);
			// A model that picks a value out of a dictionary sometimes points at a line that has nothing to do
			// with it. Such a line is worse than no line at all: the frame lands on somebody else's place in the
			// document and the card of the field quotes a stranger. The value stays, weak and asking to be
			// looked at, the pointer goes.
			Pair pair = named != null && (support >= PairScorer.EVIDENCE
					|| StringUtils.containsIgnoreCase(named.value(), checked)
					|| StringUtils.containsIgnoreCase(named.label(), checked)) ? named : null;
			String documentValue = field.dictionary() && pair != null && !StringUtils.equalsIgnoreCase(pair.value(), checked)
					? pair.value()
					: null;
			result.add(new MappedField(
					field.id(),
					checked,
					sure,
					line,
					null,
					pair == null ? null : pair.index(),
					documentValue == null ? Source.TEXT : Source.DICTIONARY,
					pair == null ? 0 : support,
					pair != null && agreed(independent, new Scored(pair, 0)),
					ambiguous(scored),
					documentValue,
					scored.stream()
							.filter(item -> item.score() >= PairScorer.EVIDENCE)
							.map(item -> item.pair().index())
							.filter(index -> pair == null || index != pair.index())
							.limit(4)
							.toList()
			));
		}

		return result;
	}

	@SneakyThrows
	private JsonNode answered(String answer) {
		String json = StringUtils.substringBeforeLast(StringUtils.substringAfter(answer, "{"), "}");
		if (StringUtils.isBlank(json)) {
			if (StringUtils.isNotBlank(answer)) {
				log.warn("ai: model answered without json: {}", StringUtils.abbreviate(answer, 500));
			}

			return objectMapper.createArrayNode();
		}

		return objectMapper.readTree("{" + json + "}").path("fields");
	}

	/** The value of the document is a value of the dictionary word for word. */
	private String exact(TargetField field, String value) {
		return field.allowed().stream().filter(item -> StringUtils.equalsIgnoreCase(item, value)).findFirst().orElse(null);
	}

	/** A dictionary field only takes a value of its dictionary, whatever the document or the model says. */
	private String allowed(TargetField field, String value) {
		return field.allowed().stream().filter(item -> StringUtils.equalsIgnoreCase(item, value)).findFirst().orElse(null);
	}

}
