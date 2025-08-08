package core.widget.filter.filter;

import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import java.time.Duration;

public class PercentFilter extends AbstractFilter<Integer> {
    public PercentFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }

    @Override
    public void setFilter(Integer value) {
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .clear();
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(String.valueOf(value));
        setApply();
    }

    @Override
    public void setFilter(Integer value, Integer endValue) {
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .clear();
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(String.valueOf(value));

        formFilter.$("input[data-test-filter-popup-end-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        formFilter.$("input[data-test-filter-popup-end-value=\"true\"]")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .clear();
        formFilter.$("input[data-test-filter-popup-end-value=\"true\"]")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(String.valueOf(endValue));
        setApply();
    }

    @Override
    public String getTypeFilter() {
        return "percent";
    }
}
