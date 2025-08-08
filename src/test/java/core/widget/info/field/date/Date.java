package core.widget.info.field.date;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;


public class Date extends BaseString<LocalDate> {

    public Date(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "date");
    }

    @Override
    public String getValueTag() {
        return "span[class*=\"ReadOnlyField\"]";
    }

    /**
     * Getting the date in the data type -  LocalDate
     *
     * @return LocalDate date
     */
    public LocalDate getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            String date = getFieldByName()
                    .shouldBe(Condition.exist)
                    .$(getValueTag())
                    .getText();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
            return LocalDate.parse(date, formatter);
        });
    }
}
