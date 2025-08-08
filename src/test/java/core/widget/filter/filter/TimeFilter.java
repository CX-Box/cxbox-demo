package core.widget.filter.filter;

import static com.codeborne.selenide.Selenide.$;

import application.config.props.ConstantSetter;
import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import core.widget.modal.Calendar;
import java.time.Duration;
import java.time.LocalDateTime;

public class TimeFilter extends AbstractFilter<LocalDateTime> {
    private String format = null;

    public TimeFilter(String columnType, String columnName, ListHelper helper, String format) {
        super(columnType, columnName, helper);
        this.format = format;
    }

    @Override
    public void setFilter(LocalDateTime value, LocalDateTime value2) {
        Calendar.setTimeWithSecond(value, format);
        Calendar.setTimeWithSecond(value2, format);
        setApply();
    }

    @Override
    public void setFilter(LocalDateTime value) {
        $(ConstantSetter.DateFilterSelector)
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        Calendar.setTimeWithSecond(value, format);
        setApply();
    }

    @Override
    public String getTypeFilter() {
        return "Time";
    }
}
