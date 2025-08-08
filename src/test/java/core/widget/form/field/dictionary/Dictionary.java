package core.widget.form.field.dictionary;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.List;
import org.openqa.selenium.By;

public class Dictionary extends BaseField<String> {
    protected final String MENU_OPTIONS = "div.ant-select-dropdown";

    public Dictionary(FormWidget formWidget, String title) {
        super(formWidget, title, "dictionary");
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    /**
     * Getting a value from a field
     *
     * @return String
     */
    @Override

    public String getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);
            return getFieldByName()
                    .$("span[data-test-field-dictionary-item=\"true\"]")
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .text();
        });
    }

    /**
     * Setting the in the field
     *
     * @param value String
     */
    @Override
    public void setValue(String value) {
        Allure.step("Setting the " + value + " in the field", step -> {
            logTime(step);
            step.parameter("value", value);
            clear();
            getFieldByName().click();
            getOptionDictionary(value)
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });
    }

    /**
     * Getting values from a list
     *
     * @return List String
     */

    public List<String> getOptions() {
        return Allure.step("Getting a list of options from a drop-down list", step -> {
            logTime(step);
            getFieldByName().click();
            return getOptionsDictionary().texts();
        });
    }

    private SelenideElement getOptionDictionary(String value) {
        return getOptionsDictionary()
                .find(Condition.match("check action name: " + value, b -> b.getText().equals(value)))
                .scrollIntoView("{block: \"center\"}");
    }

    private ElementsCollection getOptionsDictionary() {
        return getFieldByName().$(MENU_OPTIONS)
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .$$(By.tagName("li"));
    }

    /**
     * Clearing the field through the cross icon.
     */
    public void clear() {
        Allure.step("Clearing the field through the cross icon", step -> {
            logTime(step);

            if (getFieldByName()
                    .$("i[aria-label=\"icon: close-circle\"]")
                    .is(Condition.exist)) {
                getFieldByName()
                        .$("i[aria-label=\"icon: close-circle\"]")
                        .hover();
                getFieldByName()
                        .$("i[aria-label=\"icon: close-circle\"]")
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                        .click();
            }
        });


    }

    /**
     * Getting the placeholder text
     *
     * @return String
     */

    public String getPlaceholder() {
        return Allure.step("Getting the Placeholder value", step -> {
            logTime(step);
            return getFieldByName()
                    .$("div[class=\"ant-select-selection__placeholder\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .text();
        });
    }
}
