package core.widget.list.field.picklist;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.TestingTools.Constants;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SuggestionPickList extends BaseRow<String> {

    public SuggestionPickList(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "suggestionPickList", id, listHelper, filter, sort);
    }

    @Override
    @Step("Setting the {value} in the field")
    public void setValue(String value) {
        setFocusField();
        SelenideElement field = getRowByName()
                .$(getValueTag())
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
        clear();
        field
                .setValue(value);
        getItems()
                .findBy(Condition.text(value))
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
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
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$(getValueTag())
                .getValue();
    }

    @Override
    public String getValueTag() {
        return "input";
    }


    /**
     * Clearing the field
     */
    @Step("Clearing the field")
    public void clear() {
        setFocusField();

        getRowByName().click();
        getRowByName().hover();
        if (getRowByName()
                .$("i[class=\"anticon anticon-close-circle\"]")
                .is(Condition.visible)) {
            getRowByName()
                    .$("i[class=\"anticon anticon-close-circle\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
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

    private ElementsCollection getItems() {
        return $("div[class*=\"rc-select-dropdown SuggestionPickList\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$("div[class=\"rc-virtual-list\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("div[class*=\"rc-select-item rc-select-item-option\"]");
    }
}
