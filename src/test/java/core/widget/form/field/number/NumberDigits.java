package core.widget.form.field.number;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import io.qameta.allure.Allure;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.Duration;
import java.util.Objects;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.Keys;

@Slf4j
public class NumberDigits extends BaseField<BigDecimal> {


    public NumberDigits(FormWidget formWidget, String title) {
        super(formWidget, title, "number");
    }

    protected NumberDigits(FormWidget formWidget, String title, String fieldType) {
        super(formWidget, title, fieldType);
    }

    /**
     * Getting a value from a field.
     * Any numbers
     *
     * @return BigDecimal
     */
    @Override
    @SneakyThrows
    public BigDecimal getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);


            String str = Objects.requireNonNull(getFieldByName()
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
        });
    }

    public String getValueTag() {
        return "input";
    }

    /**
     * Entering a value in the field
     *
     * @param value BigDecimal
     *              {@code pattern} ***.XX
     */
    @Override
    public void setValue(BigDecimal value) {
        Allure.step("Setting the " + value + " value in the field", step -> {
            logTime(step);
            step.parameter("Big Decumimal", value);

            if (checkDigits(value) && getDigits() > 0) {
                getFieldByName().click();
                getFieldByName()
                        .$(getValueTag())
                        .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                        .clear();
                String emptyValue = getDigits() != null && getDigits() > 0 ? "0," + "0".repeat(getDigits()) : "0";
//                getFieldByName()
//                        .$("div[class=\"ant-col ant-form-item-label\"]")
//                        .click();
                if (getFieldByName().$(getValueTag()).getValue().isEmpty()) {
                    log.info("Autofill field is not enabled");
                } else {
                    log.info("Autofill field is enabled");
                    getFieldByName()
                            .$(getValueTag())
                            .shouldHave(Condition.partialValue(emptyValue), Duration.ofSeconds(waitingForTests.Timeout));
                }
                getFieldByName().click();
                getFieldByName()
                        .$(getValueTag())
                        .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                        .setValue("")
                        .setValue((String.valueOf(value)).replace(".", ","));
                getFieldByName()
                        .$(getValueTag())
                        .shouldNotHave(Condition.partialValue(emptyValue), Duration.ofSeconds(waitingForTests.Timeout));
                getFieldByName()
                        .$(getValueTag())
                        .sendKeys(Keys.TAB);
            } else {
                throw new IllegalArgumentException("Введенном вами числе нету дробной части. Рекомендуется использовать класс Percent для целых чисел или добавить дробную часть");
            }
        });
    }

    /**
     * Clearing the field using a keyboard shortcut
     */
    public void clear() {
        Allure.step("Clearing the field", step -> {
            logTime(step);

            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);
        });
    }

    /**
     * Getting the number of zeros after the decimal point
     *
     * @return Integer
     */
    public Integer getDigits() {
        return Allure.step("Getting the number of digits after the decimal point", step -> {
            logTime(step);

            if (getFieldByName().$(getValueTag()).has(Condition.attribute("digits"))) {
                String digits = getFieldByName().$(getValueTag()).getAttribute("digits");
                return Integer.parseInt(Objects.requireNonNull(digits));
            } else {
                throw new IllegalArgumentException("Argument 'digits' is not a valid digits");
            }
        });
    }

    private boolean checkDigits(BigDecimal number) {
        return Allure.step("Checking the fractional part of the number and the number of digits entered after the dot in the field", step -> {
            logTime(step);
            return number.scale() == getDigits();
        });
    }
}
