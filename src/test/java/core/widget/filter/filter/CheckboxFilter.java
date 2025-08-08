package core.widget.filter.filter;

import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import java.time.Duration;

public class CheckboxFilter extends AbstractFilter<Boolean> {
    public CheckboxFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }

    @Override
    public void setFilter(Boolean value) {
        if (value) {
            setTrue();
        } else {
            setFalse();
        }
        setApply();
    }

    @Override
    public String getTypeFilter() {
        return "checkbox";
    }

    private void set() {
        formFilter
                .$("form[class=\"ant-form ant-form-vertical\"]")
                .$("input")
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
    }

    private void setTrue() {
        set();
        if (!getValue()) {
            set();
        }
    }

    private void setFalse() {
        set();
        if (getValue()) {
            set();
        }
    }

    private Boolean getValue() {
        return formFilter
                .$("form[class=\"ant-form ant-form-vertical\"]")
                .$("input")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .isSelected();
    }

    private void setValue(Boolean value) {
        formFilter
                .$("form[class=\"ant-form ant-form-vertical\"]")
                .$("input")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .setSelected(value);
    }
}
