package core.widget.list.field.multivalue;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.sleep;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import core.widget.modal.Popup;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import org.openqa.selenium.By;

public class MultiValueList extends BaseRow<List<String>> {
    public MultiValueList(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "multivalue", id, listHelper, filter, sort);
    }

    /**
     * This method is not available for MultiValue.
     * Data entry takes place via findPopup.
     *
     * @param value UnsupportedOperationException
     */
    @Override
    @Step("Setting the in the field not available")
    public void setValue(List<String> value) {
        throw new UnsupportedOperationException("First findPopup");
    }

    /**
     * Getting a value from a field
     *
     * @return List String
     */
    @Override
    @Step("Getting a value from a field")
    public List<String> getValue() {
        return getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$(By.tagName("span"))
                .texts();
    }

    @Override
    public String getValueTag() {
        return "span[class=\"ant-form-item-children\"]";
    }

    /**
     * Clearing the field
     */
    @Step("Clearing the field")
    public void clear() {
        ElementsCollection icons = getRowByName()
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("i[class=\"anticon anticon-close\"]");
        for (SelenideElement i : icons) {
            i.shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout)).click();
            sleep(200);
            i.shouldBe(Condition.disappear, Duration.ofSeconds(waitingForTests.Timeout));
        }
    }

    private SelenideElement modalWindow() {
        return getRowByName()
                .$("i[aria-label=\"icon: folder-open\"]")
                .shouldBe(Condition.visible,
                        Duration.ofSeconds(waitingForTests.Timeout));
    }

    /**
     * Opening a modal window
     */
    @Step("Opening a modal window")
    public void openModalWindow() {
        modalWindow().click();
    }

    /**
     * Initialization of the modal window.
     * Required for data entry.
     *
     * @return Popup class of all modal windows
     */
    @Step("Validation of the modal window")
    public Optional<Popup> findPopup() {
        SelenideElement elementPopup = $("div[data-test-widget-type=\"AssocListPopup\"]")
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout));
        if (elementPopup.is(Condition.exist)) {
            return Optional.of(new Popup());
        } else {
            return Optional.empty();
        }
    }

    /**
     * Getting the placeholder value
     *
     * @return String
     */
    @Step("Getting the Placeholder value")
    public String getPlaceholder() {
        String str = getValueByAttribute(1, "span[class=\"ant-form-item-children\"] div div", "data-text");
        if (str.isEmpty()) {
            return null;
        } else {
            return str;
        }
    }
}