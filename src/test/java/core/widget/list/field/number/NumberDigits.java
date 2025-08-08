package core.widget.list.field.number;

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
import org.openqa.selenium.Keys;

public class NumberDigits extends BaseRow<BigDecimal> {

    public NumberDigits(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean sort, Boolean filter) {
        super(listWidget, title, "number", id, listHelper, sort, filter);
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
        if (checkDigits(value) && getDigits() > 0) {
            getRowByName().click();
            getRowByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .clear();
            String emptyValue = getDigits() != null && getDigits() > 0 ? "0," + "0".repeat(getDigits()) : "0";
            getRowByName()
                    .$("div[class=\"ant-col ant-form-item-label\"]")
                    .click();
            getRowByName()
                    .$(getValueTag())
                    .shouldHave(Condition.partialValue(emptyValue), Duration.ofSeconds(waitingForTests.Timeout));
            getRowByName().click();
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
     * Getting the value from the field.
     * Any numbers
     *
     * @return BigDecimal
     */
    @Override
    @Step("Getting a value from a field")
    @SneakyThrows
    public BigDecimal getValue() {
        setFocusField();
        String str = Objects.requireNonNull(getRowByName()
                .shouldBe(Condition.exist)
                .$(getValueTag())
                .getValue());
        str = str.replace(" ", "")
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
        setFocusField();
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
