package core.widget.info.field.picklist;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.time.Duration;

public class PickListField extends BaseString<String> {
    public PickListField(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "pickList");
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
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .getText();
        });
    }


    @Override
    public String getValueTag() {
        return "span[class*=\"ReadOnlyField\"]";
    }

}
