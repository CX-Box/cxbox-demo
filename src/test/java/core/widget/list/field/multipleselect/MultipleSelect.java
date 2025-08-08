package core.widget.list.field.multipleselect;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

@Slf4j
public class MultipleSelect extends BaseRow<Set<String>> {
    protected final String MENU_OPTIONS = "div.ant-select-dropdown";

    public MultipleSelect(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "multipleSelect", id, listHelper, filter, sort);
    }

    /**
     * Set values from the list. The values that have already been set are removed
     *
     * @param values Set<String>
     */
    @Override
    @Step("Setting the {value} in the field")
    public void setValue(@NonNull Set<String> values) {
        setFocusField();
        clear();
        addValue(values);
    }

    /**
     * Getting a list of selected options from a field
     *
     * @return List String [e1,e2,...en]
     */
    @Override
    @Step("Getting a value from a field")
    public Set<String> getValue() {
        setFocusField();
        List<String> list = getRowByName()
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("div[data-test-field-multipleselect-current-item=\"true\"]").texts();
        return new HashSet<>(list);
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    /**
     * Add values from the list. The values that have already been set are saved
     *
     * @param values Set<String>
     */
    @Step("Setting the {values} in the field")
    public void addValue(@NonNull Set<String> values) {
        setFocusField();
        getRowByName().click();
        values.forEach(value -> {
            if (!isSelected(value)) {
                getOption(value)
                        .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                        .click();
            }
        });
        $("body").sendKeys(Keys.ESCAPE);
    }

    /**
     * Requesting the value of a selected parameter from the list
     *
     * @param option String
     * @return Boolean true/false
     */
    @Step("Getting the option status {option}")
    public Boolean getStatusOption(String option) {
        setFocusField();
        getRowByName().click();
        return isSelected(option);
    }

    private Boolean isSelected(String option) {
        return Boolean.parseBoolean(getOption(option).getAttribute("aria-selected"));
    }

    /**
     * Вывод в консоль списка опций из списка
     */
    @Step("Getting a list of options")
    public List<String> getOptions() {
        setFocusField();
        getRowByName().click();
        return getOptionsMultipleSelect().texts();
    }

    /**
     * Clearing the field
     */
    @Step("Clearing the field")
    public void clear() {
        setFocusField();
        ElementsCollection closeX = getRowByName()
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("i[aria-label=\"icon: close\"][data-test-field-multipleselect-item-clear=\"true\"]");
        for (int i = 0; i <= closeX.size(); i++) {
            if (closeX.get(i).is(Condition.exist)) {
                closeX.get(i).click();
            }
        }
        $("body").sendKeys(Keys.ESCAPE);
    }

    private SelenideElement getOption(String nameRadio) {
        return getOptionsMultipleSelect().find(Condition.match("check action name: " + nameRadio, b -> b.getText().equals(nameRadio)));
    }

    /**
     * Getting a list of options and status
     *
     * @return Pair(String, Boolean)
     */
    @Step("Getting a list of options and status")
    public List<Pair<String, Boolean>> getStatusOptions() {
        List<String> list = getOptionsMultipleSelect().texts();
        List<Pair<String, Boolean>> pairs = new ArrayList<Pair<String, Boolean>>();
        for (int i = 0; i < list.size(); i++) {
            pairs.add(Pair.of(getOptionsMultipleSelect().get(i).text(), isSelected(list.get(i))));
        }
        return pairs;
    }

    private ElementsCollection getOptionsMultipleSelect() {
        return $(MENU_OPTIONS)
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .$$(By.tagName("li"));
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

    /**
     * This method is not supported .
     *
     * @return UnsupportedOperationException
     */
    @Step("Clicking on a hyperlink in the text or by clicking on a special element")
    public Boolean drillDown() {
        throw new UnsupportedOperationException("Filtration not supported for MultipleSelect");
    }

    /**
     * Focus on the field/A click in the field..
     */
    @Step("Focus on the segment")
    public void setFocusField() {
        if (getRowByName().$("div[class*=\"MultipleSelectField__readOnly\"]").is(Condition.exist)) {
            log.info("Focus on the field");
            getRowByName()
                    .parent()
                    .click();
        } else {
            log.error("Focus on the field didn't work out");
        }
    }

    @Override
    @Step("Read and compare")
    public boolean compareRows(String row) {
        return getRowByName().$("div").text().equals(row);
    }
}
