package core.widget.list.field.number;

import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.Objects;
import org.openqa.selenium.Keys;

public class Number extends BaseRow<Integer> {
    public Number(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean sort, Boolean filter) {
        super(listWidget, title, "number", id, listHelper, sort, filter);
    }

    /**
     * Setting the in the field.
     * Integer only.
     *
     * @param value Integer
     */
    @Override
    @Step("Setting the {value} in the field")
    public void setValue(Integer value) {
        setFocusField();
        setValue(1, value);
        waitingForTests.getWaitAllElements(getRowByName());

    }

    public void setNullValue() {
        setFocusField();

        getRowByName().click();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .clear();
        getRowByName(1)
                .$(getValueTag())
                .sendKeys(Keys.TAB);

        waitingForTests.getWaitAllElements(getRowByName());
    }

    /**
     * Getting a value from a field. Integer only
     *
     * @return Integer
     */
    @Override
    @Step("Getting a value from a field")
    public Integer getValue() {
        setFocusField();
        String str = getRowByName()
                .shouldBe(Condition.exist)
                .$(getValueTag())
                .getValue();
        str = Objects.requireNonNull(str).replace(" ", "").replace(",00", "");
        return Integer.parseInt(str);
    }

    @Step("Getting string a value from a field")
    public String getStrValue() {
        String str = getRowByName()
                .shouldBe(Condition.exist)
                .$(getValueTag())
                .getValue();
        str = Objects.requireNonNull(str).replace(" ", "").replace(",00", "");
        return str;
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    private void setValue(Integer element, Integer value) {
        getRowByName().click();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .clear();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(String.valueOf(value));
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
