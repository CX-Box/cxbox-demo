package core.widget.list.field.hint;

import core.widget.ListHelper;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;

public class Hint extends BaseRow<String> {
    public Hint(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "hint", id, listHelper, filter, sort);
    }

    /**
     * This method is not supported for Hint.
     * Hint is always read-only
     *
     * @param value UnsupportedOperationException
     */
    @Override
    public void setValue(String value) {
        throw new UnsupportedOperationException("setValue not supported for Hint");
    }

    /**
     * Getting text from a field
     *
     * @return String
     */
    @Step("Getting a value from a field")
    public String getValue() {
        throw new UnsupportedOperationException("getValue not supported for Hint");
    }

    @Override
    @Step("Setting the value is not supported for the Int type. Read only")
    public String getValueTag() {
        return "span[class=\"ant-form-item-children\"]";
    }

    /**
     * This method is not supported for Hint.
     * Hint is always read-only
     *
     * @return UnsupportedOperationException
     */
    @Step("Getting a Placeholder is not supported")
    public String getPlaceholder() {
        throw new UnsupportedOperationException("getPlaceholder not supported for Hint");
    }

    /**
     * This method is not supported for Hint.
     * Hint is always read-only
     *
     * @return UnsupportedOperationException
     */
    @Step("Filed Hint is always read-only")
    public boolean getReadOnly() {
        throw new UnsupportedOperationException("getReadOnly not supported for Hint");
    }

    /**
     * This method is not supported for Hint.
     * Hint is always read-only
     *
     * @return UnsupportedOperationException
     */
    @Step("Getting Hex Color is not supported")
    public String getHexColor() {
        throw new UnsupportedOperationException("getHexColor not supported for Hint");
    }

    /**
     * This method is not supported for Hint.
     * Hint is always read-only
     *
     * @return UnsupportedOperationException
     */
    @Step("Getting a drillDown is not supported")
    public Boolean drillDown() {
        throw new UnsupportedOperationException("drillDown not supported for Hint");
    }

    /**
     * This method is not supported for Hint.
     * Hint is always read-only
     *
     * @return UnsupportedOperationException
     */
    @Step("Getting a RequiredMessage is not supported")
    public String getRequiredMessage() {
        throw new UnsupportedOperationException("getRequiredMessage not supported for Hint");
    }
}
