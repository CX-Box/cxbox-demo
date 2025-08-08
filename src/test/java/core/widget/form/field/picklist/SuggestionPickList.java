package core.widget.form.field.picklist;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.List;
import java.util.Objects;

public class SuggestionPickList extends BaseField<String> {
    public SuggestionPickList(FormWidget formWidget, String title) {
        super(formWidget, title, "suggestionPickList");
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

            return Objects.requireNonNull(getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .getValue());
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
            step.parameter("Suggestion Pick List", value);
            SelenideElement field = getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
            clear();
            field
                    .setValue(value);
            getItems()
                    .findBy(Condition.text(value))
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    /**
     * Clearing the field
     */
    public void clear() {
        Allure.step("Clearing the field", step -> {
            logTime(step);

            getFieldByName().click();
            getFieldByName().hover();
            if (getFieldByName()
                    .$("i[class=\"anticon anticon-close-circle\"]")
                    .is(Condition.visible)) {
                getFieldByName()
                        .$("i[class=\"anticon anticon-close-circle\"]")
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                        .click();
            }
        });
    }

    /**
     * Getting a list of matching options
     *
     * @param value Symbols, which will be searched for
     * @return List(String)
     */
    public List<String> getOptions(String value) {
        return Allure.step("Getting a list of matching options by symbols " + value, step -> {
            logTime(step);
            step.parameter("Symbols", value);

            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .setValue(value);
            return getItems().texts();
        });
    }

    private ElementsCollection getItems() {
        return $("div[class*=\"rc-select-dropdown SuggestionPickList\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$("div[class=\"rc-virtual-list\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("div[class*=\"rc-select-item rc-select-item-option\"]");
    }
}
