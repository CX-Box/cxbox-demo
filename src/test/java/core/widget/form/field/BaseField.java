package core.widget.form.field;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.TestingTools.Constants;
import core.widget.form.FormWidget;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public abstract class BaseField<E> {

    final FormWidget formWidget;

    final String title;

    final String fieldType;

    final String REQUIRED_MESSAGE = "div[data-test-error-text=\"true\"]";

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    public abstract E getValue();

    @Step("Setting the {value} in the field")
    public abstract void setValue(E value);

    public abstract String getValueTag();

    public SelenideElement getFieldByName() {
        return getFieldByName(1);
    }

    public SelenideElement getFieldByName(Integer element) {
        return formWidget.getWidget()
                .$$("div[data-test-field-type='" + fieldType + "'][data-test-field-title='" + title + "']")
                .get(element - 1)
                .scrollIntoView("{block: \"center\"}")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout));
    }

    /**
     * @param element   Number of the item from the collection
     * @param value_tag A descendant tag from an item in the collection
     * @param attribute Required descendant attribute
     * @return String text
     */
    public String getValueByAttribute(Integer element, String value_tag,
                                      String attribute) {
        waitingForTests.getWaitAllFields();
        return formWidget.getWidget().$$("div[data-test-field-type='"
                        + fieldType
                        + "'][data-test-field-title='"
                        + title
                        + "'] " + value_tag)
                .get(element - 1).shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .getAttribute(attribute);
    }

    /**
     * Checking if a field is inactive
     *
     * @param value_tag Descendant's tag
     * @return boolean true/false
     */
    public boolean getElementDisabled(String value_tag) {
        return formWidget.getWidget().$("div[data-test-field-type='"
                        + fieldType
                        + "'][data-test-field-title='"
                        + title
                        + "'] " + value_tag)
                .has(Condition.attribute("disabled"));
    }

    public boolean getElementEnabled(String value_tag) {
        return formWidget.getWidget().$$("div[data-test-field-type='"
                        + fieldType
                        + "'][data-test-field-title='"
                        + title
                        + "'] " + value_tag)
                .get(0).isEnabled();
    }


    /**
     * Checking the placeholder text
     *
     * @return String text/null
     */

    public String getPlaceholder() {
        return Allure.step("Getting the Placeholder value", step -> {
            logTime(step);
            return Objects.requireNonNull(getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .getAttribute("placeholder"));
        });
    }

    /**
     * Checking an item for inactivity, ReadOnly
     *
     * @return boolean true/false
     */

    public boolean getReadOnly() {
        return Allure.step("Checking the field for \"ReadOnly\"", step -> {
            logTime(step);
            return getElementDisabled(getValueTag());
        });
    }

    /**
     * Getting a message from the error field.
     *
     * @return String text
     */

    public String getRequiredMessage() {
        return Allure.step("Getting a value from a field RequiredMessage", step -> {
            logTime(step);

            Selenide.sleep(100);
            return getFieldByName()
                    .$(REQUIRED_MESSAGE)
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .text();
        });

    }

    /**
     * Getting a message from the error field.
     *
     * @return boolean true/false
     */

    public boolean hasRequiredMessage() {
        return Allure.step("Getting a value from a field RequiredMessage", step -> {
            logTime(step);

            return getFieldByName()
                    .$(REQUIRED_MESSAGE)
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .is(Condition.visible);
        });
    }

    /**
     * Getting the field color in Hex format
     *
     * @return String/null
     */

    public String getHexColor() {
        return Allure.step("Getting the field color in Hex format", step -> {
            logTime(step);

            String color = getValueByAttribute(1, getValueTag(), "style");
            Pattern pattern = Pattern.compile("rgb\\((\\d{1,3}, \\d{1,3}, \\d{1,3})\\)");
            Matcher matcher = pattern.matcher(color);

            if (matcher.find()) {
                String rgb = matcher.group(1);
                String NewRGB = rgb.replaceAll(" ", "");
                String[] strings = NewRGB.split("[,\\\\s]+");
                int[] numbers = new int[strings.length];
                for (int i = 0; i < strings.length; i++) {
                    numbers[i] = Integer.parseInt(strings[i]);
                }
                return String.format(Constants.FormatForRgb, numbers[0], numbers[1], numbers[2]);
            } else {
                return null;
            }
        });

    }

    /**
     * Clicking on a hyperlink in the text
     */
    @Step("Clicking on a hyperlink in the text or by clicking on a special element")
    public Boolean drillDown() {
        throw new UnsupportedOperationException("drilldown not supported for inputs on Forms");
    }

    /**
     * Focus on the field/A click in the field.
     */
    public void setFocusField() {
        Allure.step("Focus on the field", step -> {
            logTime(step);
            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });

    }

    /**
     * This method is not available.
     */
    @Step("Sorting")
    public void setSorting() {
        throw new UnsupportedOperationException("Sorting not supported for inputs on Forms");
    }

    /**
     * This method is not available.
     */
    @Step("Filtering")
    public void setFiltration() {
        throw new UnsupportedOperationException("Filtration not supported for inputs on Forms");
    }

    public boolean isHidden() {
        Selenide.sleep(200);
        return !formWidget.getWidget()
                .$$("div[data-test-field-type='" + fieldType + "'][data-test-field-title='" + title + "']")
                .get(0)
                .is(Condition.exist, Duration.ofSeconds(1));
    }

}
