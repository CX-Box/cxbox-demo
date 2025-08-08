package core.widget.list.field.checkbox;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;

@Slf4j
public class Checkbox extends BaseRow<Boolean> {
    public Checkbox(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "checkbox", id, listHelper, filter, sort);
    }

    /**
     * Setting the selected value
     *
     * @param value Boolean true/false
     */
    @Override
    @Step("Setting the {value} in the field")
    public void setValue(Boolean value) {
        setFocusField();
        if (value) {
            setTrue();
        } else {
            setFalse();
        }
    }

    /**
     * CheckBox value
     *
     * @return Boolean true/false
     */
    @Override
    @Step("Getting a value from a field")
    public Boolean getValue() {
        setFocusField();
        return getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .isSelected();
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    private void set() {
        if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
            return;
        }
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
    }

    private void setTrue() {
        set();
        Selenide.sleep(100);
        if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
            return;
        }
        if (!getValue()) {
            set();
        }
    }

    private void setFalse() {
        set();
        Selenide.sleep(100);
        if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
            return;
        }
        if (getValue()) {
            set();
        }
    }

    /**
     * Focus on the field/A click in the field..
     */
    @Step("Focus on the segment")
    public void setFocusField() {
        try {
            if (getElementDisabled("input")) {
                getRowByName()
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                        .doubleClick();
            }
        } catch (Throwable t) {
            log.info(String.valueOf(t));
        }
    }

    /**
     * Clicking on a hyperlink in the text.
     * This method is not available for CheckBox
     */
    @Step("Clicking on a hyperlink in the text or by clicking on a special element")
    public Boolean drillDown() {
        throw new UnsupportedOperationException("drilldown not supported for inputs on Forms");
    }

    @Override
    @Step("Read and compare")
    public boolean compareRows(String row) {
        SelenideElement checkbox = getRowByName().$("label");
        return !Objects.equals(checkbox.getAttribute("class"), "ant-checkbox-wrapper ant-checkbox-wrapper-disabled");
    }
}
