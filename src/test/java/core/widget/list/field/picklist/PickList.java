package core.widget.list.field.picklist;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.TestingTools.Constants;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import core.widget.modal.Popup;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PickList extends BaseRow<String> {
    public PickList(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "pickList", id, listHelper, filter, sort);
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

    /**
     * Getting a value from a field
     *
     * @return String
     */
    @Override
    @Step("Getting a value from a field")
    public String getValue() {
        setFocusField();
        return getRowByName()
                .$("div[class=\"ant-select-selection-selected-value\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    private SelenideElement modalWindow() {
        return getRowByName()
                .$("i[data-test-field-picklist-popup=\"true\"]")
                .shouldBe(Condition.visible,
                        Duration.ofSeconds(waitingForTests.Timeout));
    }

    /**
     * Opening a modal window
     */
    @Step("Вызов Popup")
    public void openModalWindow() {
        setFocusField();
        modalWindow().click();
    }

    /**
     * Clearing the field
     */
    @Step("Clearing the field")
    public void clear() {
        setFocusField();
        getRowByName()
                .$("i[data-test-field-picklist-clear=\"true\"]")
                .shouldBe(Condition.visible,
                        Duration.ofSeconds(waitingForTests.Timeout)).click();
    }


    /**
     * Getting the placeholder text
     *
     * @return String
     */
    @Step("Getting the Placeholder value")
    public String getPlaceholder() {
        setFocusField();
        return getRowByName()
                .$("div[class=\"ant-select-selection__placeholder\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
    }

   /* @Step("Getting the Placeholder value")
    public String getPlaceholder() {
        setFocusField();
        return getRowByName()
            .$("input")
            .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
            .getAttribute("placeholder");
    }*/

    /**
     * Initialization of the modal window
     *
     * @return Popup class for accessing modal windows
     */
    @Step("Validation of the Popup window")
    public Optional<Popup> findPopup() {
        setFocusField();
        SelenideElement elementPopup = $("div[data-test-widget-type=\"PickListPopup\"]")
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout));
        if (elementPopup.is(Condition.exist)) {
            return Optional.of(new Popup());
        } else {
            return Optional.empty();
        }
    }

    /**
     * Getting the field color in Hex format
     *
     * @return String/null
     */
    @Step("Getting the field color in Hex format")
    public String getHexColor() {
        String color = getValueByAttribute(1, "span", "style");
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

    @Override
    @Step("Checking the field for \"ReadOnly\"")
    public boolean getReadOnly() {
        setFocusField();


        return getRowByName().$("div[class=\"ant-select-selection-selected-value\"]").is(Condition.enabled);
    }
}
