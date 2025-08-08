package core.widget.list.field.multifield;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.tuple.Pair;

public class MultiField extends BaseRow<List<Pair<String, String>>> {
    public MultiField(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "multifield", id, listHelper, filter, sort);
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

    /**
     * Getting a list consisting of a field type and text
     *
     * @return List <Pair<String, String>>
     */
    @Override
    @Step("Getting a value from a field")
    public List<Pair<String, String>> getValue() {
        setFocusField();
        List<Pair<String, String>> pairs = new ArrayList<>();
        ElementsCollection elements = elements();
        for (SelenideElement i : elements) {
            String key = i.getAttribute("data-test-field-type");
            String value = i.text();
            pairs.add(Pair.of(key, value));
        }
        return pairs;
    }

    @Override
    public String getValueTag() {
        return "span div div span";
    }

    private ElementsCollection elements() {
        return getRowByName()
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("span div div");
    }
}
