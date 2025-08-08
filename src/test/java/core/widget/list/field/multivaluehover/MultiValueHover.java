package core.widget.list.field.multivaluehover;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import core.widget.TestingTools.Constants;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MultiValueHover extends BaseRow<String> {
    public MultiValueHover(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "multivalueHover", id, listHelper, filter, sort);
    }

    /**
     * This method is not available for MultiValueHover.
     * ReadOnly.
     *
     * @param value UnsupportedOperationException
     */
    @Override
    @Step("Setting the in the field not available")
    public void setValue(String value) {
        throw new UnsupportedOperationException("setValue not supported for MultiValueHover");
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
        getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .hover();
        return $("div[class=\"ant-popover-inner\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
    }

    @Override
    public String getValueTag() {
        return "p";
    }

    /**
     * This method is not available for MultiValueHover.
     */
    @Step("Getting a Placeholder is not supported")
    public String getPlaceholder() {
        throw new UnsupportedOperationException("getPlaceholder not supported for MultiValueHover");
    }

    /**
     * This method is not available for MultiValueHover.
     */
    @Step("Type MultiValueHover is always read-only")
    public String getReadonly() {
        throw new UnsupportedOperationException("Not editable field MultiValueHover");
    }

    /**
     * This method is not supported
     *
     * @return UnsupportedOperationException
     */
    @Step("Clicking on a hyperlink in the text or by clicking on a special element")
    public Boolean drillDown() {
        throw new UnsupportedOperationException("DrillDown not supported for MultiValueHover");
    }

    /**
     * Focus on the field
     */
    @Step("Focus on the segment")
    public void setFocusField() {
        getRowByName()
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .hover();
    }

    /**
     * Getting the field color in Hex format
     *
     * @return String
     */
    @Step("Getting the field color in Hex format")
    public String getHexColor() {
        setFocusField();
        String color = getValueByAttribute(1, "p", "style");
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
    @Step("Read and compare")
    public boolean compareRows(String row) {
        return getRowByName().$("p").text().equals(row);
    }
}
