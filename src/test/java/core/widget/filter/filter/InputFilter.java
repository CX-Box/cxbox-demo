package core.widget.filter.filter;

import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import java.time.Duration;

public class InputFilter extends AbstractFilter<String> {


    public InputFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }

    @Override
    public void setFilter(String value) {
        formFilter
                .$("input[data-test-filter-popup-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        formFilter
                .$("input[data-test-filter-popup-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(value);
        setApply();
    }

    @Override
    public String getTypeFilter() {
        return "input";
    }
}
