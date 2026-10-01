package org.demo.conf.cxbox.extension.ai.mapping;

import java.util.List;

/**
 * Form field a value is looked for. The first five come from the metadata of the widget and the row meta of the
 * field, so any widget of any screen is filled without a line of code written for it.
 * <p>
 * The last three are optional constraints a project may add in the widget json. They only narrow the search
 * down: without them the field is filled the same way, just with less certainty.
 *
 * @param labels captions the document usually writes this field under, for example "Покупатель"
 * @param pattern regular expression the value has to match, for example a ten digit tax number
 * @param description a phrase for the model, for example "адрес покупателя, не поставщика"
 */
public record TargetField(
		String id,
		String key,
		String widget,
		String widgetTitle,
		String label,
		String type,
		boolean required,
		List<String> allowed,
		List<String> labels,
		String pattern,
		String description) {

	public boolean dictionary() {
		return allowed != null && !allowed.isEmpty();
	}

	public List<String> captions() {
		return labels == null || labels.isEmpty() ? List.of() : labels;
	}

}
