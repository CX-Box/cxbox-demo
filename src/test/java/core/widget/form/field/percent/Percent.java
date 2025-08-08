package core.widget.form.field.percent;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.form.FormWidget;
import core.widget.form.field.number.Number;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.Keys;

@Slf4j
public class Percent extends Number {

    public Percent(FormWidget formWidget, String title) {
        super(formWidget, title, "percent");
    }

    /**
     * Setting the value in the field
     * Integers only
     *
     * @param value Integer
     */
    @Override
    public void setValue(Integer value) {
        Allure.step("Setting the " + value + " value in the field", step -> {
            logTime(step);
            step.parameter("Percent", value);

            getFieldByName().click();
            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .clear();
            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .setValue(String.valueOf(value));
            getFieldByName()
                    .$(getValueTag())
                    .sendKeys(Keys.TAB);
            getFieldByName()
                    .$(getValueTag())
                    .shouldHave(Condition.partialValue("%"), Duration.ofSeconds(waitingForTests.Timeout));
        });
    }

    /**
     * Getting a value from a field.
     * An integer
     *
     * @return Integer
     */
    public Integer getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            String str = getFieldByName()
                    .shouldBe(Condition.exist)
                    .$(getValueTag())
                    .getValue();
            str = Objects.requireNonNull(str)
                    .replace(" ", "")
                    .replace(" ", "")
                    .replace(" %", "")
                    .replace("%", "");
            return Integer.parseInt(str);
        });
    }
}

