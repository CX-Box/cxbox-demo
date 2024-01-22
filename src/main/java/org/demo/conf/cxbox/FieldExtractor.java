package org.demo.conf.cxbox;

import com.google.common.collect.Lists;
import org.cxbox.core.ui.field.BaseFieldExtractor;
import org.cxbox.core.ui.model.BcField;
import org.cxbox.core.ui.model.json.field.FieldMeta;
import org.cxbox.core.util.JsonUtils;
import org.cxbox.model.ui.entity.Widget;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class FieldExtractor extends BaseFieldExtractor {

	@Override
	public Set<BcField> extract(Widget widget) {
		final Set<BcField> widgetFields = new HashSet<>(extractFieldsFromTitle(widget, widget.getTitle()));
		for (final FieldMeta field : JsonUtils.readValue(FieldMeta[].class, widget.getFields())) {
			widgetFields.addAll(extract(widget, field));
		}
		return widgetFields;
	}

	@Override
	public List<String> getSupportedTypes() {
		return Lists.newArrayList(
				"AdditionalInfo",
				"Funnel",
				"RingProgress",
				"DashboardList",
				"FormPopup"
		);
	}

	@Override
	public int getPriority() {
		return 1;
	}

}
