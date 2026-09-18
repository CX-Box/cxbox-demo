package org.demo.conf.cxbox.extension.ai.mapping;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.experimental.UtilityClass;
import org.apache.commons.lang3.StringUtils;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Pair;

/**
 * Picks the pairs of the document worth showing to the model for a given field, and says how well each one
 * suits it.
 * <p>
 * Nothing here knows about a particular widget, a particular document or a particular language. A pair suits a
 * field when their captions share words, and a word counts the more the rarer it is in this document: a word
 * that stands in every second caption, like "стороны" in a contract, decides nothing. Because of this step the
 * model gets a handful of candidates instead of a hundred pairs, and a small open model is enough.
 */
@UtilityClass
public class PairScorer {

	/** below this a pair is not worth showing at all */
	public static final double MIN_SCORE = 0.12;

	/** below this the captions have nothing in common and the score says only that the value has the right shape */
	public static final double EVIDENCE = 0.35;

	/** a lone candidate this good is taken without asking the model */
	public static final double SURE_SCORE = 0.62;

	/** how much better the first candidate has to be than the second one to be taken without the model */
	public static final double SURE_GAP = 0.2;

	@NonNull
	public static List<Scored> candidates(@NonNull TargetField field, @NonNull List<Pair> pairs, int limit,
			List<String> expected) {
		Pattern pattern = StringUtils.isBlank(field.pattern()) ? null : Pattern.compile(field.pattern());
		Map<String, Double> weights = weights(pairs);
		List<Scored> scored = new ArrayList<>();
		for (Pair pair : pairs) {
			if (pattern != null && !pattern.matcher(pair.value()).find()) {
				continue;
			}
			double score = score(field, pair, expected, weights);
			if (score >= MIN_SCORE) {
				scored.add(new Scored(pair, score));
			}
		}
		scored.sort((left, right) -> Double.compare(right.score(), left.score()));

		return scored.size() > limit ? List.copyOf(scored.subList(0, limit)) : List.copyOf(scored);
	}

	/**
	 * 0 means the pair has nothing to do with the field, 1 means the caption of the document says exactly what
	 * the field is called and the value fits its type.
	 */
	public static double score(TargetField field, Pair pair, List<String> expected, Map<String, Double> weights) {
		Set<String> label = words(pair.label());
		List<String> wanted = new ArrayList<>(field.captions());
		if (expected != null) {
			wanted.addAll(expected);
		}
		wanted.add(StringUtils.defaultIfBlank(field.label(), field.key()));
		double caption = wanted.stream().mapToDouble(item -> similarity(words(item), label, weights)).max().orElse(0);
		double value = valueFit(field, pair.value());

		return caption * 0.75 + value * 0.25;
	}

	/** For a dictionary the value of the document either is one of its values or is not; for the rest length is all we know. */
	private static double valueFit(TargetField field, String value) {
		if (field.dictionary()) {
			return field.allowed().stream().anyMatch(item -> StringUtils.equalsIgnoreCase(item, value)) ? 1
					: field.allowed().stream().anyMatch(item -> StringUtils.containsIgnoreCase(value, item)) ? 0.6 : 0;
		}

		return value.length() <= 200 ? 1 : 0.3;
	}

	/**
	 * How much two captions say the same thing. Counted both ways and by the weight of the words, so a long
	 * caption of the document that shares one common word with the field does not win.
	 */
	private static double similarity(Set<String> wanted, Set<String> found, Map<String, Double> weights) {
		if (wanted.isEmpty() || found.isEmpty()) {
			return 0;
		}
		double matchedWanted = 0;
		double totalWanted = 0;
		for (String word : wanted) {
			double weight = weight(word, weights);
			totalWanted += weight;
			if (found.stream().anyMatch(other -> alike(word, other))) {
				matchedWanted += weight;
			}
		}
		double matchedFound = 0;
		double totalFound = 0;
		for (String word : found) {
			double weight = weight(word, weights);
			totalFound += weight;
			if (wanted.stream().anyMatch(other -> alike(word, other))) {
				matchedFound += weight;
			}
		}
		if (totalWanted == 0 || totalFound == 0) {
			return 0;
		}
		double recall = matchedWanted / totalWanted;
		double precision = matchedFound / totalFound;

		return recall + precision == 0 ? 0 : 2 * recall * precision / (recall + precision);
	}

	/** A word standing in many captions of this document means little, a rare one means a lot. */
	private static Map<String, Double> weights(List<Pair> pairs) {
		Map<String, Integer> frequency = new HashMap<>();
		pairs.forEach(pair -> words(pair.label()).forEach(word -> frequency.merge(word, 1, Integer::sum)));
		Map<String, Double> weights = new HashMap<>();
		int total = Math.max(1, pairs.size());
		frequency.forEach((word, count) -> weights.put(word, Math.log(1.0 + (double) total / count)));

		return weights;
	}

	private static double weight(String word, Map<String, Double> weights) {
		// a word the document never uses is a word of the form, and it is as telling as the rarest one
		return weights.getOrDefault(word, Math.log(1.0 + weights.size()));
	}

	/** Words of a form and of a document rarely match letter to letter: "адрес" against "адреса". */
	private static boolean alike(String left, String right) {
		if (left.equals(right)) {
			return true;
		}
		// "1" is not a shorter way of saying "2": numbers either are the same or have nothing in common
		if (StringUtils.isNumeric(left) || StringUtils.isNumeric(right)) {
			return false;
		}
		int common = Math.min(left.length(), right.length());
		if (common < 4) {
			return false;
		}
		int prefix = 0;
		while (prefix < common && left.charAt(prefix) == right.charAt(prefix)) {
			prefix++;
		}

		return prefix >= Math.max(4, common - 2);
	}

	/**
	 * Short words are noise, short numbers are not: "Сторона-1" and "Сторона-2" differ by one character, and
	 * that character is the whole question of which side of the contract a field is about.
	 */
	private static Set<String> words(String text) {
		return Arrays.stream(StringUtils.trimToEmpty(text).toLowerCase().split("[^\\p{L}\\p{N}]+"))
				.filter(word -> word.length() > 2 || StringUtils.isNumeric(word))
				.collect(Collectors.toCollection(LinkedHashSet::new));
	}

	public record Scored(Pair pair, double score) {

	}

}
