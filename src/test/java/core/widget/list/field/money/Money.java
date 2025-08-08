package core.widget.list.field.money;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.TestingTools.Constants;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.openqa.selenium.Keys;

public class Money extends BaseRow<BigDecimal> {

    private Integer getDigits() {
        return Integer.parseInt(getValueByAttribute(1, getValueTag(), "digits"));
    }

    public Money(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean sort, Boolean filter) {
        super(listWidget, title, "money", id, listHelper, sort, filter);
    }

    /**
     * Entering a value in the field
     *
     * @param value BigDecimal
     *              {@code pattern} ***.XX
     */
    @Override
    @Step("Setting the {value} in the field")
    public void setValue(BigDecimal value) {
        setFocusField();
        String pattern = ".*\\d.\\d{2}";
        String str = value.toString();
        str = str.replace(".", ",");
        if (!str.matches(pattern)) {
            throw new IllegalArgumentException("The number does not match the pattern: " + str);
        }
        clear();
        setFocusField();
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(str);
        $("body").click();
    }

    /**
     * Getting a value from a field
     *
     * @return BigDecimal
     */
    @Override
    @Step("Getting a value from a field")
    public BigDecimal getValue() {
        setFocusField();
        String str = getRowByName()
                .shouldBe(Condition.exist)
                .$(getValueTag())
                .getValue();
        str = Objects.requireNonNull(str).replace(" ", "").replace(",", ".");
        double value = Double.parseDouble(str);
        return BigDecimal.valueOf(value).setScale(getDigits(), RoundingMode.HALF_UP);
    }

    @Override
    public String getValueTag() {
        return "input";
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
        setFocusField();
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
