package core.widget.filter.filter;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import java.time.Duration;
import java.util.Set;
import lombok.NonNull;
import org.openqa.selenium.By;

public class MultipleSelectFilter extends AbstractFilter<Set<String>> {
    public MultipleSelectFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }

    @Override
    public void setFilter(Set<String> values) {
        addValue(values);
        setApply();
    }

    @Override
    public String getTypeFilter() {
        return "multipleSelect";
    }

    public void addValue(@NonNull Set<String> values) {
        values.forEach(value -> {
            if (!isSelected(value)) {
                getOption(value)
                        .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                        .$(By.tagName("input"))
                        .click();
            }
        });
    }

    private Boolean isSelected(String option) {
        return Boolean.parseBoolean(getOption(option).getAttribute("aria-selected"));
    }

    private SelenideElement getOption(String nameRadio) {
        return getOptionsMultipleSelect().find(Condition.match("check action name: " + nameRadio, b -> b.getText().equals(nameRadio)));
    }

    private ElementsCollection getOptionsMultipleSelect() {
        return $("div[class=\"ant-popover-inner\"]")
                .$("form[class=\"ant-form ant-form-vertical\"]")
                .$$(By.tagName("li"));
    }

    public void setApply() {
        $("div[class=\"ant-popover-inner\"]")
                .$("button[data-test-filter-popup-apply=\"true\"]")
                .shouldBe(Condition.visible)
                .click();
    }
}
