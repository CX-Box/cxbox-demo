package core.widget.form.field.hidden;

import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;

public class Hidden extends BaseField<String> {
    public Hidden(FormWidget formWidget, String title) {
        super(formWidget, title, "hidden");
    }

    @Override
    public String getValue() {
        throw new UnsupportedOperationException("setValue not supported for Hidden");
    }

    @Override
    public void setValue(String value) {
        throw new UnsupportedOperationException("setValue not supported for Hidden");
    }

    @Override
    public String getValueTag() {
        throw new UnsupportedOperationException("setValue not supported for Hidden");
    }
}
