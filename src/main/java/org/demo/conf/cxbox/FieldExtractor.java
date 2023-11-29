package org.demo.conf.cxbox;

import com.google.common.collect.Lists;
import org.cxbox.core.util.JsonUtils;
import org.cxbox.meta.entity.Widget;
import org.cxbox.meta.ui.field.BaseFieldExtractor;
import org.cxbox.meta.ui.field.link.LinkFieldExtractor;
import org.cxbox.meta.ui.model.BcField;
import org.cxbox.meta.ui.model.json.field.FieldMeta;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FieldExtractor extends BaseFieldExtractor {

	public FieldExtractor(@Autowired LinkFieldExtractor linkFieldExtractor) {
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
				"Funnel",
				"RingProgress",
				"DashboardList"
		);
	}

	@Override
	public int getPriority() {
		return 1;
	}

}
