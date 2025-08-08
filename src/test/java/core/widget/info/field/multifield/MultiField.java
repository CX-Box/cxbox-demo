package core.widget.info.field.multifield;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.tuple.Pair;

public class MultiField extends BaseString<List<Pair<String, String>>> {
    public MultiField(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "multifield");
    }

    /**
     * Getting a list consisting of a field type and text
     *
     * @return List Pair(String, String)
     */
    @Override
    public List<Pair<String, String>> getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            List<Pair<String, String>> pairs = new ArrayList<>();
            ElementsCollection elements = elements();
            for (SelenideElement i : elements) {
                String key = i.getAttribute("data-test-field-type");
                String value = i.$(getValueTag()).getText();
                pairs.add(Pair.of(key, value));
            }
            return pairs;
        });

    }

    private ElementsCollection elements() {
        return getFieldByName()
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("div[class*=\"MultiField__listValue\"][data-test=\"FIELD\"]");
    }

    @Override
    public String getValueTag() {
        return "span[class*=\"ReadOnlyField\"]";
    }
}
