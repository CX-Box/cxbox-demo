package core.widget.info.field.multivalue;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.List;

public class MultiValue extends BaseString<List<String>> {

    public MultiValue(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "multivalue");
    }

    /**
     * Getting a value from a field
     *
     * @return List String
     */
    @Override
    public List<String> getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            return getFieldByName()
                    .$("div[class*=\"InfoCell__fieldData\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .$$(getValueTag())
                    .texts();
        });

    }

    @Override
    public String getValueTag() {
        return "div[class*=\"MultiValueListRecord\"]";
    }

    /**
     * This method is not available..
     *
     * @return UnsupportedOperationException
     */
    @Step("Clicking on a hyperlink in the text or by clicking on a special element")
    public Boolean drillDown() {
        throw new UnsupportedOperationException("drillDown not supported for CheckBox on Info");
    }

}
