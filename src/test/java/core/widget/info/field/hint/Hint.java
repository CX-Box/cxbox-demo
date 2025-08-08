package core.widget.info.field.hint;

import static core.widget.TestingTools.CellProcessor.logTime;

import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;


public class Hint extends BaseString<String> {
    public Hint(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "hint");
    }

    public String getValueTag() {
        return "span[class*=\"ReadOnlyField\"]";
    }

    /**
     * Getting text from a field
     *
     * @return String
     */
    public String getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            return getFieldByName().$(getValueTag()).text();
        });
    }

    /**
     * This method is not supported for Hint.
     * Hint is always read-only
     * UnsupportedOperationException
     */
    @Step("Setting the value is not supported for the Int type. Read only")
    public void setValue() {
        throw new UnsupportedOperationException("setValue not supported for Hint");
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
