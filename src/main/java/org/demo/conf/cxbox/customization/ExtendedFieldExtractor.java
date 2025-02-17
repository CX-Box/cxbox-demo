package org.demo.conf.cxbox.customization;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.cxbox.core.util.JsonUtils;
import org.cxbox.meta.data.WidgetDTO;
import org.cxbox.meta.ui.field.BaseFieldExtractor;
import org.cxbox.meta.ui.field.link.LinkFieldExtractor;
import org.cxbox.meta.ui.model.BcField;
import org.cxbox.meta.ui.model.json.field.FieldMeta;
import org.springframework.stereotype.Service;

@Service
public class ExtendedFieldExtractor extends BaseFieldExtractor {

	protected ExtendedFieldExtractor(LinkFieldExtractor linkFieldExtractor) {
		super(linkFieldExtractor);
	}

	@Override
	public Set<BcField> extract(WidgetDTO widget) {
		final Set<BcField> widgetFields = new HashSet<>(extractFieldsFromTitle(widget, widget.getTitle()));
		for (final FieldMeta field : JsonUtils.readValue(FieldMeta[].class, widget.getFields())) {
			widgetFields.addAll(extract(widget, field));
		}
		return widgetFields;
	}

	@Override
	public List<String> getSupportedTypes() {
		return List.of(
				"AdditionalList",
				"StatsBlock",
				"AdditionalInfo",
				"Funnel",
				"RingProgress",
				"DashboardList",
				"FormPopup",
				"GroupingHierarchy",
				"Pie1D",
				"Column2D",
				"Line2D",
				"DualAxes2D"
		);
	}

	@Override
	public int getPriority() {
		return 1;
	}

}
