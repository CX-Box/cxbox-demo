package org.demo.conf.cxbox.extension.ai.web;

import java.util.List;

/**
 * What the form asks to fill: the attached document and the fields of the widgets of the current view that are
 * open for editing.
 */
public record AiExtractRequest(String fileId, String bcName, List<Field> fields) {

	/**
	 * A field of a widget, not of a form in general. One screen holds "Заявитель" and "Ответчик" side by side,
	 * their fields are called the same and mean different things, so the widget is part of the question: its
	 * name identifies the field and its title is what tells the model whose value it is looking for.
	 *
	 * @param id identity of the field on the screen, widget and key together
	 * @param widget name of the widget the field is rendered by
	 * @param widgetTitle title the person sees above that widget, for example "Ответчик"
	 * @param bcName business component of the widget
	 * @param labels optional captions of the document this field is usually written under
	 * @param pattern optional regular expression the value has to match
	 * @param description optional phrase for the model
	 */
	public record Field(
			String id,
			String key,
			String widget,
			String widgetTitle,
			String bcName,
			String label,
			String type,
			Boolean required,
			List<String> allowed,
			List<String> labels,
			String pattern,
			String description) {

	}

}
