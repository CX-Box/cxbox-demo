package core.widget.list.field.picklist;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import core.widget.ListHelper;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.openqa.selenium.By;

public class InlinePickList extends BaseRow<String> {
    public InlinePickList(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "inline-pickList", id, listHelper, filter, sort);
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
        clear();
        getRowByName()
                .$("div[class=\"ant-select-selection__placeholder\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(value);
        for (String i : getValues().texts()) {
            if (i.equals(value)) {
                int index = getValues().texts().indexOf(i);
                getValues()
                        .get(index)
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                        .click();
            }
        }
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
                .$("div[class=\"ant-select-selection-selected-value\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    private ElementsCollection getValues() {
        return $("ul[role=\"listbox\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$(By.tagName("li"));
    }

    /**
     * Getting a list of options via a character match
     *
     * @param value String Symbol
     * @return List String Match results
     */
    @Step("Getting a list of options via a character match")
    public List<String> getValueInList(String value) {
        Allure.addAttachment("Value", value);
        setFocusField();
        getRowByName()
                .$("div[class=\"ant-select-selection-selected-value\"]")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(value);
        return new ArrayList<>(getValues().texts());
    }

    /**
     * Clearing the field
     */
    @Step("Clearing the field")
    public void clear() {
        setFocusField();
        boolean iconClear = getRowByName()
                .$("span[class=\"ant-select-selection__clear\"]")
                .is(Condition.exist);
        if (iconClear) {
            getRowByName()
                    .$("span[class=\"ant-select-selection__clear\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        }
    }

    /**
     * Getting the placeholder text
     *
     * @return String
     */
    @Step("Getting the Placeholder value")
    public String getPlaceholder() {
        setFocusField();
        return getRowByName()
                .$("div[class=\"ant-select-selection__placeholder\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
    }
}
