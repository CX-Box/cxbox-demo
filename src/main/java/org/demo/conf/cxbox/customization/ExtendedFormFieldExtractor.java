package org.demo.conf.cxbox.customization;

import static org.cxbox.api.util.i18n.LocalizationFormatter.i18n;

import com.google.common.collect.ImmutableList;
import java.util.Set;
import org.cxbox.core.util.JsonUtils;
import java.util.HashSet;
import java.util.List;
import org.cxbox.meta.entity.Widget;
import org.cxbox.meta.ui.field.link.LinkFieldExtractor;
import org.cxbox.meta.ui.model.BcField;
import org.cxbox.meta.ui.model.json.field.FieldGroup;
import org.cxbox.meta.ui.model.json.field.FieldMeta;

public class ExtendedFormFieldExtractor extends DemoBaseFieldExtractor {

	public ExtendedFormFieldExtractor(LinkFieldExtractor linkFieldExtractor) {
		super(linkFieldExtractor);
	}

	@Override
	public Set<BcField> extract(Widget widget) {
		final Set<BcField> widgetFields = new HashSet<>(extractFieldsFromTitle(widget, i18n(widget.getTitle())));
		for (final FieldGroup group : JsonUtils.readValue(FieldGroup[].class, widget.getFields())) {
			if (group.getChildren() != null) {
				for (final FieldMeta field : group.getChildren()) {
					widgetFields.addAll(extract(widget, field));
				}
			}
		}
		return widgetFields;
	}

	@Override
	public List<String> getSupportedTypes() {
		return ImmutableList.of(
				"Form"
		);
	}

	@Override
	public int getPriority() {
		return Integer.MAX_VALUE;
	}

}
