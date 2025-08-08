package core.widget.list.field.hidden;

import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;

public class Hidden extends BaseRow<String> {
    public Hidden(ListWidget listWidget, String title, String id) {
        super(listWidget, title, "hidden", id, null, null, null);
    }

    @Override
    public void setValue(String value) {
        throw new UnsupportedOperationException("setValue not supported for Hidden");
    }

    @Override
    public String getValue() {
        throw new UnsupportedOperationException("setValue not supported for Hidden");
    }

    @Override
    public String getValueTag() {
        throw new UnsupportedOperationException("setValue not supported for Hidden");
    }
}
