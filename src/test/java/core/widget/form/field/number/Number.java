package core.widget.form.field.number;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;
import org.openqa.selenium.Keys;


public class Number extends BaseField<Integer> {

    public Number(FormWidget formWidget, String title) {
        super(formWidget, title, "number");
    }

    protected Number(FormWidget formWidget, String title, String fieldType) {
        super(formWidget, title, fieldType);
    }

    /**
     * Getting a value from a field. Integers only
     *
     * @return Integer
     */
    @Override
    public Integer getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            String str = getFieldByName()
                    .shouldBe(Condition.exist)
                    .$(getValueTag())
                    .getValue();
            assert str != null;
            str = str.replace(" ", "").replace(",00", "");
            return Integer.parseInt(str);
        });
    }


    public String getStrValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            String str = getFieldByName()
                    .shouldBe(Condition.exist)
                    .$(getValueTag())
                    .getValue();
            assert str != null;
            str = str.replace(" ", "").replace(",00", "");
            return str;
        });
    }


    public String getValueTag() {
        return "input";
    }

    /**
     * Setting the value in the field.
     * Integers only.
     *
     * @param value Integer
     */
    @Override
    @Step("")
    public void setValue(Integer value) {
        Allure.step("Setting the " + value + " value in the field", step -> {
            logTime(step);
            step.parameter("Number", value);

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
        });
    }

    /**
     * Clearing the field using a keyboard shortcut
     */
    public void clear() {
        Allure.step("Clearing the field", step -> {
            logTime(step);

            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);
        });
    }
}
