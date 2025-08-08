package core.widget.info.field.text;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.time.Duration;


public class Text extends BaseString<String> {
    public Text(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "text");
    }

    /**
     * Getting a value from a field
     *
     * @return String
     */
    public String getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            return getFieldByName()
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .$(getValueTag())
                    .getText();
        });
    }

    public String getValueTag() {
        return "span[class*=\"ReadOnlyField\"]";
    }

}
