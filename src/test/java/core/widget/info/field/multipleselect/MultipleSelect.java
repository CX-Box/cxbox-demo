package core.widget.info.field.multipleselect;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;

public class MultipleSelect extends BaseString<String> {

    public MultipleSelect(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "multipleSelect");
    }

    /**
     * Getting the selected option from the field
     *
     * @return String
     */
    @Override
    public String getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            return getFieldByName()
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .$(getValueTag())
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .getText();
        });
    }

    public String getValueTag() {
        return "div[class*=\"MultipleSelectField\"]";
    }

    /**
     * This method is not available..
     *
     * @return UnsupportedOperationException
     */
    @Step("Getting the field color in Hex format")
    public String getHexColor() {
        throw new UnsupportedOperationException("getHexColor not supported for MultipleSelect on Info");
    }

    /**
     * This method is not available..
     *
     * @return UnsupportedOperationException
     */
    @Step("Clicking on a hyperlink in the text or by clicking on a special element")
    public Boolean drillDown() {
        throw new UnsupportedOperationException("drillDown not supported for MultipleSelect on Info");
    }

}
