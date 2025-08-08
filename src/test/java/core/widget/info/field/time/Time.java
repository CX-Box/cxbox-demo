package core.widget.info.field.time;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class Time extends BaseString<LocalDateTime> {

    private String format = "HH:mm:ss";

    public Time(InfoWidget infoWidget, String title, String format) {
        super(infoWidget, title, "time");
        this.format = format;
    }

    @Override
    public String getValueTag() {
        return "span[class*=\"ReadOnlyField\"]";
    }


    /**
     * Return the date in the appropriate data type
     *
     * @return LocalDateTime
     * @example LocalDateTime.of(2020, 10, 10, 10, 10)
     */
    public LocalDateTime getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            String time = getFieldByName()
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .$(getValueTag())
                    .getText();

            LocalTime times = LocalTime.parse(time, DateTimeFormatter.ofPattern(format));

            LocalDateTime dateTime = times.atDate(LocalDate.of(2024, 12, 5));

            return dateTime;
        });
    }

    public String getStringValue() {
        return getFieldByName().shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout)).$(getValueTag())
                .getText();
    }

}
