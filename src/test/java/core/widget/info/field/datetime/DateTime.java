package core.widget.info.field.datetime;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTime extends BaseString<LocalDateTime> {
    public DateTime(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "dateTime");
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

            String date = getFieldByName()
                    .shouldBe(Condition.exist)
                    .$(getValueTag())
                    .getText();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
            return LocalDateTime.parse(date, formatter);
        });

    }

}
