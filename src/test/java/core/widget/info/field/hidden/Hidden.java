package core.widget.info.field.hidden;

import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;

public class Hidden extends BaseString<String> {
    public Hidden(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "hidden");
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
