package core.widget.form.field.date;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import core.widget.modal.Calendar;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import org.openqa.selenium.By;


public class Date extends BaseField<LocalDate> {

    public Date(FormWidget formWidget, String title) {
        super(formWidget, title, "date");
    }

    public String getValueTag() {
        return "input";
    }

    /**
     * Date input: year, month, day
     *
     * @param value LocalDate
     *              {@code example} LocalDate date = LocalDate.of(2024, 20, 5)
     */
    @Override
    public void setValue(LocalDate value) {
        Allure.step("Setting the " + value + " in the field", step -> {
            logTime(step);
            step.parameter("LocalDate value", value);
            clearIcon();
            Selenide.sleep(100);
            setFocusField();
            Calendar.clear();
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            Calendar.setDate(value);
        });

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
                    .getValue();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
            return LocalDate.parse(Objects.requireNonNull(date), formatter);
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
