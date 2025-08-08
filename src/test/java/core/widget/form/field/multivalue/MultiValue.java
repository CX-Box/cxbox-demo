package core.widget.form.field.multivalue;

import static com.codeborne.selenide.Condition.exist;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import core.widget.modal.Popup;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.openqa.selenium.By;

public class MultiValue extends BaseField<List<String>> {

    public MultiValue(FormWidget formWidget, String title) {
        super(formWidget, title, "multivalue");
    }

    /**
     * Getting a value from a field
     *
     * @return List String
     */
    @Override
    public List<String> getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            List<String> strings = getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .$$(By.tagName("span"))
                    .texts();
            Collections.reverse(strings);
            return strings;
        });
    }

    /**
     * This method is not available for MultiValue.
     * Data entry takes place via findPopup.
     *
     * @param value UnsupportedOperationException
     */
    @Override
    @Step("Setting the value in the field is not available")
    public void setValue(List<String> value) {
        throw new UnsupportedOperationException("First findPopup");
    }

    /**
     * Clearing the field
     */
    public void clear() {
        Allure.step("Clearing the field", step -> {
            logTime(step);
            ElementsCollection icons = getFieldByName()
                    .shouldBe(exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .$$("i[class=\"anticon anticon-close\"]");

            for (SelenideElement i : icons) {
                i.shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
                waitingForTests.getWaitAllElements(i);
                Selenide.sleep(300);
                i.click();
                i.shouldBe(Condition.disappear, Duration.ofSeconds(waitingForTests.Timeout));
            }
        });
    }


    private SelenideElement modalWindow() {
        return getFieldByName()
                .$("i[aria-label=\"icon: folder-open\"]")
                .shouldBe(Condition.visible,
                        Duration.ofSeconds(waitingForTests.Timeout));
    }

    /**
     * Opening a modal window
     */
    public void openModalWindow() {
        Allure.step("Opening a modal window", step -> {
            logTime(step);

            modalWindow().click();
            Selenide.sleep(100);
        });
    }

    @Override
    public String getValueTag() {
        return "span[class=\"ant-form-item-children\"]";
    }

    /**
     * Initialization of the modal window.
     * Required for data entry.
     *
     * @return Popup class of all modal windows
     */
    public Optional<Popup> findPopup() {
        return Allure.step("Validation of the modal window", step -> {
            logTime(step);
            SelenideElement elementPopup = $("div[data-test-widget-type=\"AssocListPopup\"]")
                    .shouldBe(visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .shouldBe(exist, Duration.ofSeconds(waitingForTests.Timeout));
            if (elementPopup.is(Condition.exist)) {
                return Optional.of(new Popup());
            } else {
                return Optional.empty();
            }
        });

    }

    public boolean getReadOnly() {
        return !getFieldByName().$$x(".//*[contains(@class, 'disabled')]").isEmpty();
    }

    /**
     * Getting the placeholder value
     *
     * @return String
     */
    public String getPlaceholder() {
        return Allure.step("Getting the Placeholder value", step -> {
            logTime(step);
            String str = getValueByAttribute(1, "span[class=\"ant-form-item-children\"] div div", "data-text");
            if (str.isEmpty()) {
                return null;
            } else {
                return str;
            }
        });
    }
}
