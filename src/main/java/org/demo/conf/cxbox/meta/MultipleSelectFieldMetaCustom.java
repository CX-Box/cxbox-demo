package org.demo.conf.cxbox.meta;

import org.cxbox.core.ui.field.CxboxWidgetField;
import org.cxbox.core.ui.model.json.field.FieldMeta;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@CxboxWidgetField({"multipleSelect"})
public class MultipleSelectFieldMetaCustom extends FieldMeta.FieldMetaBase {

}