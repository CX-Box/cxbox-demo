package core.widget.additionalinformation;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.HashMap;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class AdditionalInformationWidget {
    protected final String title;
    protected final SelenideElement widget;
    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    /**
     * Getting all values from fields
     *
     * @return HashMap  Title - Value
     */

    public HashMap<String, String> getValue() {
        return Allure.step("Getting all values from fields", step -> {
            logTime(step);

            HashMap<String, String> values = new HashMap<>();
            waitingForTests.getWaitAllElements(widget);
            ElementsCollection elementsCollection = widget
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .$$("div[class=\"ant-row\"]");
            for (SelenideElement element : elementsCollection) {
                String key;
                String value;
                if (element.$("div[class*=\"AdditionalInfoWidget_rowLabel\"]").is(Condition.exist)
                        &&
                        element.$("div[data-test]").is(Condition.exist)) {
                    key = element.$("div[class*=\"AdditionalInfoWidget_rowLabel\"]").getText();
                    value = element.$("div[data-test]").getText();
                } else {
                    key = "";
                    value = "";
                }
                values.put(key, value);
            }
            return values;
        });
    }


}
