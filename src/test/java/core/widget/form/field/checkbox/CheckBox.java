package core.widget.form.field.checkbox;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import io.qameta.allure.Allure;
import java.time.Duration;


public class CheckBox extends BaseField<Boolean> {
    public CheckBox(FormWidget formWidget, String title) {
        super(formWidget, title, "checkbox");
    }

    public String getValueTag() {
        return "input";
    }

    /**
     * CheckBox value
     *
     * @return Boolean true/false
     */
    @Override

    public Boolean getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);
            return getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .isSelected();
        });
    }


    /**
     * Setting the selected value
     *
     * @param value Boolean true/false
     */
    @Override
    public void setValue(Boolean value) {
        Allure.step("Setting the " + value + " in the field", step -> {
            logTime(step);
            step.parameter("value", value);

            if (value) {
                setTrue();
            } else {
                setFalse();
            }
        });
    }

    private void set() {
        getFieldByName()
                .$(getValueTag())
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
    }

    private void setTrue() {
        set();
        if (!getValue()) {
            set();
        }
    }

    private void setFalse() {
        set();
        if (getValue()) {
            set();
        }
    }

    public void setTrueWithError() {
        set();
    }


}
