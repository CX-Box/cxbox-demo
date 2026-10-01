package org.demo.conf.cxbox.extension.ai.mapping;

import java.util.List;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument.Box;

/**
 * Value found for a field of the form, together with everything the person needs to check it: where it came
 * from, how well the document supports it, what the document itself says and what else could have been taken.
 *
 * @param box place of the value on the page, empty when the engine gives no coordinates
 * @param pair number of the pair the value was taken from
 * @param score 0..1, how well the pair suits the field, counted by {@link PairScorer}
 * @param agreed the model chose the very pair the search put first: two independent signals said the same
 * @param ambiguous the document holds another pair that suits the field just as well, as a contract holds an
 * address of every side: the value is shown as one to check, however sure both signals were
 * @param documentValue text of the document when the value put on the field is not that text word for word,
 * which happens for a dictionary: the document says "в работе" and the field takes "In progress"
 * @param alternatives other pairs that suit this field, most suitable first, so a wrong guess is corrected in
 * one click instead of a search through the document
 */
public record MappedField(
		String key,
		String value,
		/** how sure the model says it is about this very value: exact, likely or guess */
		String sure,
		Integer line,
		Box box,
		Integer pair,
		Source source,
		double score,
		boolean agreed,
		boolean ambiguous,
		String documentValue,
		List<Integer> alternatives) {

	public enum Source {

		/** the caption of the document matched the field of the form, the model was not needed */
		LABEL,

		/** the model matched a value of the dictionary to what the document says, word for word it is not there */
		DICTIONARY,

		/** there were no pairs for this field, the model read the plain text of the document */
		TEXT

	}

}
