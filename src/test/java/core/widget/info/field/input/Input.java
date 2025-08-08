package core.widget.info.field.input;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.time.Duration;

public class Input extends BaseString<String> {
    public Input(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "input");
    }

    /**
     * Getting a value from a field. При отсутствии значения, возвращает null.
     *
     * @return String text / null
     */
    @Override
    public String getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            if (getFieldByName()
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .$(getValueTag()).is(Condition.visible)) {
                return getFieldByName()
                        .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                        .$(getValueTag())
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                        .getText();
            } else {
                return null;
            }
        });
    }

    @Override
    public String getValueTag() {
        return "span[class*=\"ReadOnlyField\"]";
    }
}
