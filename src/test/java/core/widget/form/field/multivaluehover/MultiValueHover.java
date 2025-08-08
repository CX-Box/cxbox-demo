package core.widget.form.field.multivaluehover;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;

public class MultiValueHover extends BaseField<String> {
    public MultiValueHover(FormWidget formWidget, String title) {
        super(formWidget, title, "multivalueHover");
    }

    /**
     * Getting a value from a field
     *
     * @return String
     */
    @Override
    public String getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .hover();
            return $("div[class=\"ant-popover-inner\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .text();
        });
    }

    /**
     * This method is not available for MultiValueHover.
     * ReadOnly.
     *
     * @param value UnsupportedOperationException
     */
    @Override
    @Step("Setting the in the field not available")
    public void setValue(String value) {
        throw new UnsupportedOperationException("setValue not supported for MultiValueHover");
    }

    @Override
    public String getValueTag() {
        return "p";
    }

    /**
     * This method is not available for MultiValueHover.
     */
    @Step("Getting a Placeholder is not supported")
    public String getPlaceholder() {
        throw new UnsupportedOperationException("getPlaceholder not supported for MultiValueHover");
    }

    /**
     * This method is not available for MultiValueHover.
     */
    @Step("Type MultiValueHover is always read-only")
    public String getReadonly() {
        throw new UnsupportedOperationException("Not editable field MultiValueHover");
    }
}
