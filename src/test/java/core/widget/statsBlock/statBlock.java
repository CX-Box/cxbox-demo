package core.widget.statsBlock;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.TestingTools.Constants;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class statBlock {
    protected final SelenideElement block;
    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    /**
     * Click on the block to apply the filter
     */
    public void clickOnBlock() {
        Allure.step("Click on the block to apply the filter", step -> {
            logTime(step);

            block
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });

    }

    /**
     * Getting text when hovering over a block
     *
     * @return String
     */

    public String getTextHover() {
        return Allure.step("Getting text when hovering over a block", step -> {
            logTime(step);

            block
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .hover();
            return $("div[class=\"ant-tooltip ant-tooltip-placement-top\"] div[class=\"ant-tooltip-inner\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .text();
        });

    }

    /**
     * Getting the value of the "data-icon" attribute. Getting an icon
     *
     * @return String
     */

    public String getIcon() {
        return Allure.step("Getting the attribute value \"data-icon\"", step -> {
            logTime(step);

            return Objects.requireNonNull(block.shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .$("svg")
                    .getAttribute("data-icon"));
        });
    }

    /**
     * Getting the number from the block corresponding to the number of rows when clicking on the filter
     *
     * @return Integer
     */

    public int getNumberOfRows() {
        return Allure.step("Getting the number from the block corresponding to the number of rows when clicking on the filter", step -> {
            logTime(step);

            return Integer.parseInt(block.shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .$("div[class*=\"StatsBlock__itemContent\"] div:nth-child(1)")
                    .getText());
        });

    }

    /**
     * Getting the block color in Hex format
     *
     * @return String
     */

    public String getHexColorBlock() {
        return Allure.step("Getting the block color in Hex format", step -> {
            logTime(step);

            String color = block
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .$("div[class*=\"ant-list-item StatsBlock__itemContainer\"]")
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
        });
    }
}
