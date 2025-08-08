package core.widget.info.field.dictionary;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.time.Duration;

public class Dictionary extends BaseString<String> {

    public Dictionary(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "dictionary");
    }

    @Override
    public String getValueTag() {
        //TODO Rename
        return "div[data-test-field-value=\"true\"]";
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
                    .$(getValueTag())
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .getText();
        });
    }
}
