package core.widget.form.field.datetimewithseconds;


import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import core.widget.modal.Calendar;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

public class DateTimeWithSeconds extends BaseField<LocalDateTime> {

    public DateTimeWithSeconds(FormWidget formWidget, String title) {
        super(formWidget, title, "dateTimeWithSeconds");
    }

    public String getValueTag() {
        return "input";
    }

    /**
     * Return the date in the appropriate data type
     *
     * @return LocalDateTime
     */

    public LocalDateTime getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            String date = getFieldByName().shouldBe(Condition.exist).$(getValueTag()).getValue();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
            return LocalDateTime.parse(Objects.requireNonNull(date), formatter);
        });
    }

    /**
     * Setting the date in the calendar
     *
     * @param value LocalDateTime with Second
     *              {@code example} LocalDateTime dateTime = LocalDateTime.of(2020, 15, 10, 10, 10, 10)
     */
    @Override
    public void setValue(LocalDateTime value) {
        Allure.step("Setting the " + value + " in the field", step -> {
            logTime(step);
            step.parameter("LocalDateTime with Seconds", value);

            clearIcon();
            setFocusField();
            Calendar.setDateTimeWithSecond(value);
        });

    }

    /**
     * Clearing the field through the cross icon.
     */
    public void clearIcon() {
        Allure.step("Clearing the field through the cross icon", step -> {
            logTime(step);

            getFieldByName()
                    .$("i[aria-label=\"icon: close-circle\"]")
                    .hover()
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });
    }
}
