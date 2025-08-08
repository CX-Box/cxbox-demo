package core.widget.filter.filter;

import static com.codeborne.selenide.Selenide.$;

import application.config.props.ConstantSetter;
import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import core.widget.modal.Calendar;
import java.time.Duration;
import java.time.LocalDate;

public class DateFilter extends AbstractFilter<LocalDate> {
    public DateFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }

    @Override
    public void setFilter(LocalDate value, LocalDate value2) {
        Calendar.setDate(value);

        Calendar.setDate(value2);
        setApply();
    }

    @Override
    public void setFilter(LocalDate value) {

        $(ConstantSetter.DateFilterSelector)
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        Calendar.setDate(value);
        setApply();
    }

    @Override
    public String getTypeFilter() {
        return "date";
    }
}
