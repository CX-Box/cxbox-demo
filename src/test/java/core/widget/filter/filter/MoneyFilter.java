package core.widget.filter.filter;

import application.config.props.ConstantSetter;
import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import java.math.BigDecimal;
import java.time.Duration;
import org.openqa.selenium.Keys;

public class MoneyFilter extends AbstractFilter<BigDecimal> {
    public MoneyFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }

    @Override
    public void setFilter(BigDecimal value) {
        String pattern = ".*\\d.\\d{2}";
        String str = value.toString();
        str = str.replace(".", ",");
        assert str.matches(pattern) : ConstantSetter.MoneyFilterMissPatternMessage;

        clearOne();
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(str);

    }

    @Override
    public void setFilter(BigDecimal value, BigDecimal endValue) {
        String pattern = ".*\\d.\\d{2}";
        String str = value.toString();
        str = str.replace(".", ",");
        assert str.matches(pattern) : "The number does not match the pattern.";

        String endPattern = ".*\\d.\\d{2}";
        String endStr = endValue.toString();
        endStr = endStr.replace(".", ",");
        assert endStr.matches(pattern) : "The number does not match the pattern.";

        clear();
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(str);
        formFilter.$("input[data-test-filter-popup-end-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        formFilter.$("input[data-test-filter-popup-end-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .setValue(endStr);
        setApply();
    }

    @Override
    public String getTypeFilter() {
        return "money";
    }

    private void clear() {
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        formFilter.$("input[data-test-filter-popup-start-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);

        formFilter.$("input[data-test-filter-popup-end-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        formFilter.$("input[data-test-filter-popup-end-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);
    }

    private void clearOne() {
        formFilter.$("input[data-test-filter-popup-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        formFilter.$("input[data-test-filter-popup-value=\"true\"]")
                .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                .sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);
    }

}
