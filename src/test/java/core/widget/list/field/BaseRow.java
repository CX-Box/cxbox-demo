package core.widget.list.field;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebDriverRunner;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.ListHelper;
import core.widget.TestingTools.Constants;
import core.widget.list.ListWidget;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Getter
@Slf4j
public abstract class BaseRow<E> {
    final ListWidget listWidget;

    final String title;

    final String fieldType;

    final String id;

    final String REQUIRED_MESSAGE = "div[class=\"ant-tooltip-inner\"]";

    final ListHelper listHelper;

    final Boolean filter;

    final Boolean sort;

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();


    public SelenideElement getRowByName(Integer element) {
        return $("tr[data-test-widget-list-row-id=\"" + id + "\"][data-test-widget-list-row-type=\"Row\"]")
                .$$("div[data-test-field-type='" + fieldType + "'][data-test-field-title='" + title + "']")
                .get(element - 1)
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout));
    }

    public abstract void setValue(E value);

    public abstract E getValue();

    public abstract String getValueTag();

    public SelenideElement getRowByName() {
        return getRowByName(1);
    }

    /**
     * @param element   Number of the item from the collection
     * @param value_tag A descendant tag from an item in the collection
     * @param attribute Required descendant attribute
     * @return String text
     */
    @Step("Getting the attribute value {attribute}")
    public String getValueByAttribute(Integer element, String value_tag,
                                      String attribute) {
        Allure.addAttachment("Elenent", element.toString());
        Allure.addAttachment("Value tag", value_tag);
        Allure.addAttachment("Attribute", attribute);
        return listWidget.getWidget().$$("div[data-test-field-type='"
                        + fieldType
                        + "'][data-test-field-title='"
                        + title
                        + "'] " + value_tag)
                .get(element - 1).shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .getAttribute(attribute);
    }

    /**
     * Checking for field inactivity
     *
     * @param value_tag Descendant's tag
     * @return boolean true/false
     */
    public boolean getElementDisabled(String value_tag) {
        return listWidget.getWidget().$("div[data-test-field-type='"
                        + fieldType
                        + "'][data-test-field-title='"
                        + title
                        + "'] " + value_tag)
                .has(Condition.attribute("disabled"));
    }

    /**
     * Checking the placeholder text
     *
     * @return String text/null
     */
    @Step("Getting the Placeholder value")
    public String getPlaceholder() {
        setFocusField();
        return getRowByName()
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .$(getValueTag())
                .getAttribute("placeholder");
    }

    /**
     * Checking an item for inactivity, ReadOnly
     *
     * @return boolean true/false
     */
    @Step("Checking the field for \"ReadOnly\"")
    public boolean getReadOnly() {
        setFocusField();
        return getElementDisabled(getValueTag());
    }

    /**
     * Getting a message from the error field.
     *
     * @return String text
     */
    @Step("Getting a value from a field RequiredMessage")
    public String getRequiredMessage() {
        setFocusField(); // Проверить необходимость
        Selenide.sleep(100);
        Selenide.actions()
                .moveToElement($("body"))
                .perform();
        getRowByName()
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$("div.ant-row.ant-form-item")
                .hover();
        return getRowByName()
                .$(REQUIRED_MESSAGE)
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .text()
                .replace(title, "");
    }

    /**
     * Getting a message from the error field.
     *
     * @return boolean true/false
     */
    @Step("Getting a value from a field RequiredMessage")
    public boolean hasRequiredMessage(int index) {
        Allure.addAttachment("Index", String.valueOf(index));
        String str = getRowByName()
                .$(REQUIRED_MESSAGE)
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
        return str.equals(Constants.list.get(index - 1));
    }

    /**
     * Getting the field color in Hex format
     *
     * @return String/null
     */
    @Step("Getting the field color in Hex format")
    public String getHexColor() {
        setFocusField();
        String color = getValueByAttribute(1, getValueTag(), "style");
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
     * Clicking on a hyperlink
     *
     * @return Boolean true/false
     */
    @Step("Clicking on a hyperlink in the text or by clicking on a special element")
    public Boolean drillDown() {
        String oldUrl = WebDriverRunner.url();
        getRowByName().$("span a").click();
        String newUrl = WebDriverRunner.url();
        return oldUrl.equals(newUrl) && $x("//body").exists();
    }

    /**
     * Focus on the field/A click in the field..
     */
    @Step("Focus on the segment")
    public void setFocusField() {
        if (getRowByName().$("span[class*=\"ReadOnlyField\"]").is(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))) {
            log.info("Focus on the field");
            getRowByName()
                    .parent()
                    .doubleClick();
        } else {
            log.error("Focus on the field didn't work out");
        }
    }

    /**
     * Sorting
     */
    @Step("Sorting")
    public void setSorting() {
        if (getSort()) {
            listHelper.setSorting(title);
            waitingForTests.getWaitAllElements(getRowByName());
        }
    }

    /**
     * Filtering
     */
    @Step("Filtering")
    public void setFiltration() {
        throw new UnsupportedOperationException("Filtration not supported for inputs on List");
    }

    @Step("Read and compare")
    public boolean compareRows(String row) {
        return getRowByName().$("span").text().equals(row);
    }

    public boolean isHidden() {
        Selenide.sleep(200);

        return !$("tr[data-test-widget-list-row-id=\"" + id + "\"][data-test-widget-list-row-type=\"Row\"]")
                .$$("div[data-test-field-type='" + fieldType + "'][data-test-field-title='" + title + "']")
                .get(0)
                .is(Condition.exist, Duration.ofSeconds(1));
    }

}
