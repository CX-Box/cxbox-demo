package core.widget.info.field.checkbox;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.time.Duration;

public class CheckBox extends BaseString<Boolean> {
    public CheckBox(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "checkbox");
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
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .isSelected();
        });
    }

    /**
     * This method is not available..
     *
     * @return UnsupportedOperationException
     */
    public String getHexColor() {
        throw new UnsupportedOperationException("getHexColor not supported for CheckBox on Info");
    }

    /**
     * This method is not available..
     *
     * @return UnsupportedOperationException
     */
    public Boolean drillDown() {
        throw new UnsupportedOperationException("drillDown not supported for CheckBox on Info");
    }
}
