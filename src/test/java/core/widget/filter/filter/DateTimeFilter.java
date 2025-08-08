package core.widget.filter.filter;

import static com.codeborne.selenide.Selenide.$;

import application.config.props.ConstantSetter;
import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import core.widget.modal.Calendar;
import java.time.Duration;
import java.time.LocalDateTime;

public class DateTimeFilter extends AbstractFilter<LocalDateTime> {
    public DateTimeFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }


    @Override
    public void setFilter(LocalDateTime value) {
        $(ConstantSetter.DateFilterSelector)
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        Calendar.setDateTime(value);
        setApply();
    }

    @Override
    public String getTypeFilter() {
        return "dateTime";
    }
}
