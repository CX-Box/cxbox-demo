package core.widget.list.field.input;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.TestingTools.Constants;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.openqa.selenium.Keys;

public class Input extends BaseRow<String> {
    public Input(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean sort, Boolean filter) {
        super(listWidget, title, "input", id, listHelper, sort, filter);
    }

    /**
     * Setting the
     *
     * @param value String
     */
    @Override
    @Step("Setting the {value} in the field")
    public void setValue(String value) {
        setValue(1, value);
    }

    /**
     * Getting a value from a field
     *
     * @return String text
     */
    @Override
    @Step("Getting a value from a field")
    public String getValue() {
        setFocusField();
        return getRowByName()
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .$(getValueTag())
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .getValue();
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    private void setValue(Integer element, String value) {
        setFocusField();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled)
                .clear();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled)
                .setValue(value);
        getRowByName(element)
                .$(getValueTag())
                .shouldNot(Condition.empty);
        getRowByName(element)
                .$(getValueTag())
                .sendKeys(Keys.TAB);
    }

    /**
     * Checking for the number of entered Symbols
     *
     * @param n number of Symbols
     * @return boolean true/false
     */
    @Step("Getting the number of Symbols that a field accepts")
    public boolean getMaxInput(Integer n) {
        String str = getValue();
        return String.valueOf(str).length() == n;
    }

    @Step("Getting the field color in Hex format")
    public String getHexColor() {
        SelenideElement span = $("[data-test='FIELD'] span");
        String color = span.getAttribute("style");
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

    /**
     * Clearing the field using a keyboard shortcut
     */
    @Step("Clearing the field")
    public void clear() {
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);
    }
}
