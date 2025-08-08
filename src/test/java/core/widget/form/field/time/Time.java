package core.widget.form.field.time;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import core.widget.modal.Calendar;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import org.openqa.selenium.By;

public class Time extends BaseField<LocalDateTime> {

    private String format = "HH:mm:ss";

    public Time(FormWidget formWidget, String title, String format) {
        super(formWidget, title, "time");
        this.format = format;
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    /**
     * Time input: hour, minute (ignores date part)
     *
     * @param value LocalDateTime (time part will be used)
     */
    @Override
    public void setValue(LocalDateTime value) {
        Allure.step("Setting the time " + value.toLocalTime() + " in the field", step -> {
            logTime(step);
            step.parameter("LocalDateTime value", value);
            clearIcon();
            Selenide.sleep(100);
            setFocusField();
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            String timeStr = value.format(DateTimeFormatter.ofPattern(format));

            Calendar.setTimeWithSecond(value, format);
        });
    }

    /**
     * Getting the time from the field as LocalDateTime (with today's date)
     *
     * @return LocalDateTime (time part meaningful)
     */
    @Override
    public LocalDateTime getValue() {
        return Allure.step("Getting time value from the field", step -> {
            logTime(step);

            String time = getFieldByName()
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .$(getValueTag())
                    .getValue();

            LocalTime times = LocalTime.parse(time, DateTimeFormatter.ofPattern(format));
            LocalDateTime dateTime = times.atDate(LocalDate.of(2024, 12, 5));
            return dateTime;
        });
    }


    /**
     * Clears the time input using the cross icon.
     */
    public void clearIcon() {
        Allure.step("Clearing the time field using cross icon", step -> {
            logTime(step);

            getFieldByName()
                    .$("i[aria-label=\"icon: close-circle\"]")
                    .hover()
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });
    }
}
