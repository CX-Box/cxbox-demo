package core.widget.list.field.multivalue;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.sleep;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.TestingTools.Constants;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import core.widget.modal.Popup;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.openqa.selenium.By;

public class MultiValue extends BaseRow<List<String>> {
    public MultiValue(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
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
        openInlineRedactor();
        SelenideElement element = $(By.cssSelector("div[data-test='FIELD'][data-test-field-type='multivalue'] div[data-text]"));
        String str = element.getAttribute("data-text");
        if (str.isEmpty()) {
            return null;
        } else {
            return str;
        }
    }

    public boolean getReadOnly() {
        openInlineRedactor();
        return !getRowByName().$$x(".//*[contains(@class, 'disabled')]").isEmpty();
    }

    public String getHexColor() {
        String color = $("div[data-test='FIELD'][data-test-field-type='multivalue'][data-test-field-title='Custom Field'] > p")
                .getAttribute("style");
        Pattern pattern = Pattern.compile("rgb\\((\\d{1,3}, \\d{1,3}, \\d{1,3})\\)");
        Matcher matcher = pattern.matcher(color);

        if (matcher.find()) {
            String rgb = matcher.group(1);
            String NewRGB = rgb.replaceAll(" ", "");
            String[] strings = NewRGB.split("[,\\\\s]+");
            int[] numbers = new int[strings.length];
            for (int i = 0; i < strings.length; i++) {
                numbers[i] = Integer.parseInt(strings[i]);
            }
            return String.format(Constants.FormatForRgb, numbers[0], numbers[1], numbers[2]);
        } else {
            return null;
        }
    }


    public void openInlineRedactor() {
        $(By.cssSelector("tr[data-test-widget-list-row-type='Row']"))
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.getTimeout()))
                .click();
    }

    @Override
    @Step("Read and compare")
    public boolean compareRows(String row) {
        return getRowByName().$("p").text().equals(row);
    }
}
