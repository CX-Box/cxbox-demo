package core.widget.form.field.radio;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import org.openqa.selenium.By;

public class Radio extends BaseField<String> {
    public Radio(FormWidget formWidget, String title) {
        super(formWidget, title, "radio");
    }

    public String getValueTag() {
        return "input";
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

            int size = getContainersActions().size();
            for (int i = 0; i < size; i++) {
                if (getContainersActions().get(i).$(getValueTag()).isSelected()) {
                    return getContainersActions().get(i).text();
                }
            }
            return null;
        });
    }

    /**
     * Setting the in the field.
     *
     * @param nameRadio String
     */
    @Override
    public void setValue(String nameRadio) {
        Allure.step("Setting the " + nameRadio + " in the field", step -> {
            logTime(step);
            step.parameter("Radio name", nameRadio);

            getRadio(nameRadio)
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
            getRadio(nameRadio)
                    .isSelected();
        });
    }

    /**
     * Getting a value from a field
     *
     * @return HashMap(String, Boolean)
     */

    public HashMap<String, Boolean> getValues() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            HashMap<String, Boolean> values = new HashMap<>();
            List<String> list = getContainersActions().texts();
            for (int i = 0; i < list.size(); i++) {
                String text = getContainersActions().get(i).text();
                boolean isSelected = getContainersActions().get(i).$(getValueTag()).isSelected();
                values.put(text, isSelected);
            }
            return values;
        });
    }

    private SelenideElement getRadio(String nameRadio) {
        return getContainersActions().find(Condition.match("check action name: " + nameRadio, b -> b.getText().equals(nameRadio)));
    }

    private ElementsCollection getContainersActions() {
        return getFieldByName()
                .$("div[class=\"ant-form-item-control\"]")
                .$$(By.tagName("label"))
                .shouldHave(CollectionCondition.sizeGreaterThan(0));
    }
}
