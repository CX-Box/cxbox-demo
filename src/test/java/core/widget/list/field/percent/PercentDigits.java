package core.widget.list.field.percent;

import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.Duration;
import java.util.Objects;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.Keys;

@Slf4j
public class PercentDigits extends BaseRow<BigDecimal> {
    public PercentDigits(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "percent", id, listHelper, filter, sort);
    }

    /**
     * Setting the in the field
     * For numbers with a fractional part
     *
     * @param value BigDecimal
     */
    @Override
    @Step("Setting the {value} in the field")
    public void setValue(BigDecimal value) {
        setFocusField();
        if (checkDigits(value) && getDigits() > 0) {
            getRowByName().click();
            getRowByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .clear();
            getRowByName()
                    .$(getValueTag())
                    .sendKeys(Keys.TAB);
            String emptyValue = getDigits() != null && getDigits() > 0 ? "0," + "0".repeat(getDigits()) : "0";
            if (getRowByName().$(getValueTag()).getValue().isEmpty()) {
                log.info("Autofill field is not enabled");
            } else {
                log.info("Autofill field is enabled");
                getRowByName()
                        .$(getValueTag())
                        .shouldHave(Condition.partialValue(emptyValue), Duration.ofSeconds(waitingForTests.Timeout));
            }
            getRowByName()
                    .$(getValueTag())
                    .click();
            getRowByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .setValue("")
                    .setValue((String.valueOf(value)).replace(".", ","));
            getRowByName()
                    .$(getValueTag())
                    .shouldNotHave(Condition.partialValue(emptyValue), Duration.ofSeconds(waitingForTests.Timeout));
            getRowByName()
                    .$(getValueTag())
                    .sendKeys(Keys.TAB);
            getRowByName()
                    .$(getValueTag())
                    .shouldHave(Condition.partialValue("%"), Duration.ofSeconds(waitingForTests.Timeout));
        } else {
            throw new IllegalArgumentException("Введенном вами числе нету дробной части. Рекомендуется использовать класс Percent для целых чисел или добавить дробную часть");
        }
    }

    /**
     * Getting a value from a field.
     * Integer
     *
     * @return BigDecimal
     */
    @Step("Getting a value from a field")
    @SneakyThrows
    public BigDecimal getValue() {
        setFocusField();
        String str = Objects.requireNonNull(getRowByName()
                .shouldBe(Condition.exist)
                .$(getValueTag())
                .getValue());
        str = str.replace(" %", "")
                .replace(" ", "")
                .replace(" ", "")
                .replace(",", ".");

        int digits = getDigits();

        DecimalFormatSymbols symbols = new DecimalFormatSymbols();
        symbols.setDecimalSeparator('.');

        String pattern = "#,##0." + "0".repeat(Math.max(0, digits));
        DecimalFormat decimalFormat = new DecimalFormat(pattern, symbols);

        decimalFormat.setParseBigDecimal(true);
        return (BigDecimal) decimalFormat.parse(str);
    }

    @Override
    public String getValueTag() {
        return "input";
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

    /**
     * Getting the number of zeros after the decimal point
     *
     * @return Integer
     */
    @Step("Getting the number of digits after the decimal point")
    public Integer getDigits() {
        if (getRowByName().$(getValueTag()).has(Condition.attribute("digits"))) {
            String digits = getRowByName().$(getValueTag()).getAttribute("digits");
            return Integer.parseInt(Objects.requireNonNull(digits));
        } else {
            throw new IllegalArgumentException("Argument 'digits' is not a valid digits");
        }
    }

    @Step("Checking the fractional part of the number and the number of digits entered after the dot in the field")
    private boolean checkDigits(BigDecimal number) {
        Allure.addAttachment("Number", number.toString());
        return number.scale() == getDigits();
    }

}
