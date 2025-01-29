package org.demo.conf.cxbox.extension.fieldtype;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.cxbox.meta.ui.field.CxboxWidgetField;
import org.cxbox.meta.ui.model.json.field.FieldMeta;

/**
 * Info Field
 */
@EqualsAndHashCode(callSuper = true)
@Data
@CxboxWidgetField("info")
public class InfoFieldMetaCustom extends FieldMeta.FieldMetaBase {

}
