package core.widget.list.field.text;

import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;
import java.time.Duration;
import org.openqa.selenium.Keys;

public class Text extends BaseRow<String> {
    public Text(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "text", id, listHelper, filter, sort);
    }

    /**
     * Setting the in the field
     *
     * @param value String
     */
    @Override
    @Step("Setting the {value} in the field")
    public void setValue(String value) {
        setFocusField();
        setValue(1, value);
    }

    /**
     * Getting a value from a field
     *
     * @return String
     */
    @Override
    @Step("Getting a value from a field")
    public String getValue() {
        setFocusField();
        return getRowByName()
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .$(getValueTag())
                .getValue();
    }

    @Override
    public String getValueTag() {
        return "textarea";
    }

    public void setValue(Integer element, String value) {
        getRowByName().click();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .clear();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .sendKeys(value);
        getRowByName(element)
                .$(getValueTag())
                .sendKeys(Keys.TAB);
    }

    /**
     * Clearing the field using a keyboard shortcut
     */
    @Step("Clearing the field")
    public void clear() {
        setFocusField();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);
    }
}
