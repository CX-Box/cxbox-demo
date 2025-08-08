package core.widget.form.field.multifield;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.tuple.Pair;

public class MultiField extends BaseField<List<Pair<String, String>>> {
    public MultiField(FormWidget formWidget, String title) {
        super(formWidget, title, "multifield");
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
                String value = i.text();
                pairs.add(Pair.of(key, value));
            }
            return pairs;
        });
    }

    private ElementsCollection elements() {
        return getFieldByName()
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("span div div");
    }

    /**
     * This method is not supported for  MultiField.
     * ReadOnly.
     *
     * @param value UnsupportedOperationException
     */
    @Override
    @Step("Setting the in the field not available")
    public void setValue(List<Pair<String, String>> value) {
        throw new UnsupportedOperationException("setValue not supported for MultiField");
    }

    @Override
    public String getValueTag() {
        return "span div div span";
    }
}
