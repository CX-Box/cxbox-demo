package core.widget.list.field.radio;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import org.openqa.selenium.By;

public class Radio extends BaseRow<String> {
    public Radio(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "radio", id, listHelper, filter, sort);
    }

    /**
     * Setting the in the field.
     *
     * @param nameRadio String
     */
    @Override
    @Step("Setting the {nameRadio} in the field")
    public void setValue(String nameRadio) {
        setFocusField();
        getRadio(nameRadio)
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        getRadio(nameRadio)
                .isSelected();
    }

    /**
     * Getting a value from a field
     *
     * @return String
     */
    @Override
    @Step("Getting a value from a field")
    public String getValue() {
        setFocusField();
        int size = getContainersActions().size();
        for (int i = 0; i < size; i++) {
            if (getContainersActions().get(i).$(getValueTag()).isSelected()) {
                return getContainersActions().get(i).text();
            }
        }
        return null;
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    /**
     * Getting a value from a field
     *
     * @return HashMap(String, Boolean)
     */
    @Step("Getting a value from a field")
    public HashMap<String, Boolean> getValues() {
        setFocusField();
        HashMap<String, Boolean> values = new HashMap<>();
        List<String> list = getContainersActions().texts();
        for (int i = 0; i < list.size(); i++) {
            values.put(getContainersActions()
                            .get(i)
                            .text(),
                    getContainersActions()
                            .get(i)
                            .$(getValueTag())
                            .isSelected());
        }
        return values;
    }

    private SelenideElement getRadio(String nameRadio) {
        return getContainersActions().find(Condition.match("check action name: " + nameRadio, b -> b.getText().equals(nameRadio)));
    }

    private ElementsCollection getContainersActions() {
        return getRowByName()
                .$$(By.tagName("label"))
                .shouldHave(CollectionCondition.sizeGreaterThan(0));
    }
}
