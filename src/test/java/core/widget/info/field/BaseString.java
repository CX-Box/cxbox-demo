package core.widget.info.field;

import static com.codeborne.selenide.Selenide.$x;
import static com.codeborne.selenide.Selenide.Wait;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebDriverRunner;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.TestingTools.Constants;
import core.widget.info.InfoWidget;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.openqa.selenium.By;

@RequiredArgsConstructor
public abstract class BaseString<E> {
    final InfoWidget infoWidget;

    final String title;

    final String fieldType;

    final String REQUIRED_MESSAGE = "div[data-test-error-text=\"true\"]";

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    @Step("Getting a value from a field")
    public abstract E getValue();

    /**
     * Setting the in the field. not available For InfoWidget
     */
    @Step("Setting the in the field. not available For InfoWidget")
    public void setValue() {
        throw new UnsupportedOperationException("setValue not supported for InfoWidget. Only read");
    }


    public abstract String getValueTag();

    public SelenideElement getFieldByName() {
        return getFieldByName(1);
    }

    public SelenideElement getFieldByName(Integer element) {
        return infoWidget.getWidget()
                .$$("div[data-test-field-type='" + fieldType + "'][data-test-field-title=\"" + title + "\"]")
                .get(element - 1)
                .scrollIntoView("{block: \"center\"}")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout));
    }

    /**
     * @param element   Number of the item from the collection
     * @param value_tag A descendant tag from an item in the collection
     * @param attribute Required descendant attribute
     * @return String text
     */
    public String getValueByAttribute(Integer element, String value_tag,
                                      String attribute) {
        return infoWidget.getWidget().$$("div[data-test-field-type='"
                        + fieldType
                        + "'][data-test-field-title='"
                        + title
                        + "'] " + value_tag)
                .get(element - 1).shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .getAttribute(attribute);
    }

    /**
     * Checking the Placeholder text
     *
     * @return String text/null
     */
    @Step("Getting the Placeholder value")
    public String getPlaceholder() {
        throw new UnsupportedOperationException("Placeholder not supported for Info Widget");
    }

    /**
     * Checking for inactivity
     *
     * @param value_tag Descendant's tag
     * @return boolean true/false
     */
    public boolean getElementDisabled(String value_tag) {
        return infoWidget.getWidget().$("div[data-test-field-type='"
                        + fieldType
                        + "'][data-test-field-title='"
                        + title
                        + "'] " + value_tag)
                .has(Condition.attribute("disabled"));
    }

    /**
     * Checking an item for inactivity, ReadOnly
     *
     * @return boolean true/false
     */
    @Step("Checking the field for \"ReadOnly\"")
    public boolean getReadOnly() {
        throw new UnsupportedOperationException("Info Widget is always readonly");
    }

    /**
     * Getting a message from the error field.
     *
     * @return String text
     */
    public String getRequiredMessage() {
        return Allure.step("Getting a value from a field RequiredMessage", step -> {
            logTime(step);

            return getFieldByName()
                    .$(REQUIRED_MESSAGE)
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .text()
                    .replace(title, "");
        });
    }

    /**
     * Getting the field color in Hex format
     *
     * @return String/null
     */
    public String getHexColor() {
        return Allure.step("Getting the field color in Hex format", step -> {
            logTime(step);

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
        });
    }

    /**
     * Clicking on a hyperlink
     *
     * @return Boolean true/false
     */
    public Boolean drillDown() {
        return Allure.step("Clicking on a hyperlink in the text or by clicking on a special element", step -> {
            logTime(step);

            String oldUrl = WebDriverRunner.url();
            getFieldByName().$(getValueTag()).getWrappedElement().findElement(By.cssSelector("span:has(a)")).click();
            Wait().until(webDriver -> !webDriver.getCurrentUrl().contains(oldUrl));
            String newUrl = WebDriverRunner.url();
            return !oldUrl.equals(newUrl) && $x("//body").exists();
        });
    }

    /**
     * Focus on the field/A click in the field.
     */
    public void setFocusField() {
        Allure.step("Focus on the field/A click in the field.", step -> {
            logTime(step);

            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });
    }

    /**
     * Sorting
     */
    @Step("Sorting")
    public void setSorting() {
        throw new UnsupportedOperationException("Sorting not supported for Info Widget");
    }

    /**
     * Filtering
     */
    @Step("Filtering")
    public void setFiltration() {
        throw new UnsupportedOperationException("Filtration not supported for for Info Widget");
    }

    public boolean isHidden() {
        Selenide.sleep(200);
        return !infoWidget.getWidget()
                .$$("div[data-test-field-type='" + fieldType + "'][data-test-field-title='" + title + "']")
                .get(0)
                .is(Condition.exist, Duration.ofSeconds(1));
    }
}
