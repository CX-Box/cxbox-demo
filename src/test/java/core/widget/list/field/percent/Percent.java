package core.widget.list.field.percent;

import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.Keys;

@Slf4j
public class Percent extends BaseRow<Integer> {

    public Percent(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean sort, Boolean filter) {
        super(listWidget, title, "percent", id, listHelper, sort, filter);
    }

    /**
     * Setting the in the field
     * Integer only
     *
     * @param value Integer
     */
    @Override
    @Step("Setting the {value} in the field")
    public void setValue(Integer value) {
        setFocusField();
        getRowByName().click();
        clear();
        String emptyValue = "0";
        getRowByName()
                .$(getValueTag())
                .sendKeys(Keys.TAB);
        if (Objects.requireNonNull(getRowByName().$(getValueTag()).getValue()).isEmpty()) {
            log.info("Autofill field is not enabled");
        } else {
            log.info("Autofill field is enabled");
            getRowByName()
                    .$(getValueTag())
                    .shouldHave(Condition.partialValue(emptyValue), Duration.ofSeconds(waitingForTests.Timeout));
        }
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(String.valueOf(value));
        getRowByName()
                .$(getValueTag())
                .shouldNotHave(Condition.partialValue(emptyValue), Duration.ofSeconds(waitingForTests.Timeout));
        getRowByName()
                .$(getValueTag())
                .sendKeys(Keys.TAB);
        getRowByName()
                .$(getValueTag())
                .shouldHave(Condition.partialValue("%"), Duration.ofSeconds(waitingForTests.Timeout));
    }

    /**
     * Getting a value from a field.
     * Integer
     *
     * @return Integer
     */
    @Step("Getting a value from a field")
    public Integer getValue() {
        setFocusField();
        String str = getRowByName()
                .shouldBe(Condition.exist)
                .$(getValueTag())
                .getValue();
        str = Objects.requireNonNull(str).replace(" ", "").replace(" %", "");
        return Integer.parseInt(str);
    }

    @Override
    public String getValueTag() {
        return "input";
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

    @Override
    @Step("Read and compare")
    public boolean compareRows(String row) {
        return getRowByName().$("div span").text().equals(row);
    }
}
