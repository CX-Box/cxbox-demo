package core.widget.form.field.input;

import static com.codeborne.selenide.Selenide.$x;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.WebDriverRunner;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.Objects;
import org.openqa.selenium.Keys;


public class Input extends BaseField<String> {
    final String fieldType;

    public Input(FormWidget formWidget, String title) {
        super(formWidget, title, "input");
        this.fieldType = "input";
    }

    protected Input(FormWidget formWidget, String title, String fieldType) {
        super(formWidget, title, fieldType);
        this.fieldType = fieldType;
    }

    public String getValueTag() {
        if (Objects.equals(fieldType, "text")) {
            return fieldType + "area";
        }
        return fieldType;
    }

    /**
     * Getting a value from a field
     *
     * @return String text
     */
    @Override

    public String getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            return Objects.requireNonNull(getFieldByName()
                    .shouldBe(Condition.exist)
                    .$(getValueTag())
                    .getValue());
        });
    }

    /**
     * Setting the value
     *
     * @param value String
     */
    @Override
    public void setValue(String value) {
        Allure.step("Setting the " + value + " value in the field", step -> {
            logTime(step);
            step.parameter("value", value);

            setValue(1, value);
        });

    }

    private void setValue(Integer element, String value) {
        getFieldByName().click();
        getFieldByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled)
                .clear();
        getFieldByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled)
                .setValue(value);
        getFieldByName(element)
                .$(getValueTag())
                .shouldNot(Condition.empty);
        getFieldByName(element)
                .$(getValueTag())
                .sendKeys(Keys.TAB);
    }

    /**
     * Checking for the number of characters entered
     *
     * @param n number of characters
     * @return boolean true/false
     */
    public boolean getMaxInput(Integer n) {
        return Allure.step("Getting the number of characters that a field accepts", step -> {
            logTime(step);
            step.parameter("number of characters", n);

            String str = getValue();
            return String.valueOf(str).length() == n;
        });
    }

    /**
     * Clearing the field using a keyboard shortcut
     */
    public void clear() {
        Allure.step("Clearing the field", step -> {
            logTime(step);

            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);
        });
    }

    /**
     * Clicking on a hyperlink.
     * After the transition, the old Url and the new Url are checked.,
     * after waiting for the items on the page.
     *
     * @return Boolean true/false
     */
    public Boolean drillDown() {
        return Allure.step("Click-through when clicking on a hyperlink or a special element in a field", step -> {
            logTime(step);

            if (fieldType.equals("text")) {
                super.drillDown();
            }
            String oldUrl = WebDriverRunner.url();
            getFieldByName().$("i[class=\"anticon anticon-link\"]").click();
            String newUrl = WebDriverRunner.url();
            waitingForTests.getContextMenu();
            assert oldUrl != null;
            return oldUrl.equals(newUrl) && $x("//body").exists();
        });
    }
}