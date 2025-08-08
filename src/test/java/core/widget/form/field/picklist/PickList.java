package core.widget.form.field.picklist;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import core.widget.modal.Popup;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.Optional;

public class PickList extends BaseField<String> {
    public PickList(FormWidget formWidget, String title) {
        super(formWidget, title, "pickList");
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
                    .$("div[class=\"ant-select-selection-selected-value\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .getText();
        });

    }

    /**
     * This method is not available for PickListField.
     * The values are entered via findPopup
     *
     * @param value UnsupportedOperationException
     */
    @Override
    @Step("Setting the in the field not available")
    public void setValue(String value) {
        throw new UnsupportedOperationException("First findPopup");
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    private SelenideElement modalWindow() {
        return getFieldByName()
                .$("i[data-test-field-picklist-popup=\"true\"]")
                .shouldBe(Condition.visible,
                        Duration.ofSeconds(waitingForTests.Timeout));
    }

    /**
     * Opening a modal window
     */
    public void openModalWindow() {
        Allure.step("Launch Popup", step -> {
            logTime(step);

            modalWindow().click();
        });

    }

    /**
     * Clearing the field
     */
    public void clear() {
        Allure.step("Clearing the field", step -> {
            logTime(step);

            getFieldByName()
                    .$("i[data-test-field-picklist-clear=\"true\"]")
                    .shouldBe(Condition.visible,
                            Duration.ofSeconds(waitingForTests.Timeout)).click();
        });
    }

    /**
     * Checking the placeholder text
     *
     * @return String text/null
     */

    public String getPlaceholder() {
        return Allure.step("Getting the Placeholder value", step -> {
            logTime(step);

            return getFieldByName()
                    .$("div[class=\"ant-select-selection__placeholder\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout)).text();
        });
    }

    /**
     * Initialization of the modal window
     *
     * @return Popup class for accessing modal windows
     */
    public Optional<Popup> findPopup() {
        return Allure.step("Validation of the Popup window", step -> {
            logTime(step);

            SelenideElement elementPopup = $("div[data-test-widget-type=\"PickListPopup\"]")
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout));
            if (elementPopup.is(Condition.exist)) {
                return Optional.of(new Popup());
            } else {
                return Optional.empty();
            }
        });
    }
}
