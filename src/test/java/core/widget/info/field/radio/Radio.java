package core.widget.info.field.radio;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.time.Duration;

public class Radio extends BaseString<String> {
    public Radio(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "radio");
    }

    @Override
    public String getValueTag() {
        return "span[class*=\"ReadOnlyField\"]";
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

            return getFieldByName()
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .$(getValueTag())
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .getText();
        });
    }
}
