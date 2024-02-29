package org.demo.conf.cxbox;

import com.google.common.collect.Lists;
import java.util.Set;
import org.cxbox.core.util.JsonUtils;
import java.util.HashSet;
import java.util.List;
import org.cxbox.meta.entity.Widget;
import org.cxbox.meta.ui.field.BaseFieldExtractor;
import org.cxbox.meta.ui.field.link.LinkFieldExtractor;
import org.cxbox.meta.ui.model.BcField;
import org.cxbox.meta.ui.model.json.field.FieldMeta;
import org.springframework.stereotype.Service;

@Service
public class DashboardWidgetsFieldExtractor extends BaseFieldExtractor {

	protected DashboardWidgetsFieldExtractor(LinkFieldExtractor linkFieldExtractor) {
		super(linkFieldExtractor);
	}

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
