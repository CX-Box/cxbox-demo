package core.widget.form.field.money;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.form.FormWidget;
import core.widget.form.field.number.NumberDigits;
import io.qameta.allure.Allure;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;

public class Money extends NumberDigits {

    public Money(FormWidget formWidget, String title) {
        super(formWidget, title, "money");
    }

    /**
     * Getting a value from a field
     *
     * @return BigDecimal
     */
    @Override

    public BigDecimal getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            String str = getFieldByName()
                    .shouldBe(Condition.exist)
                    .$(getValueTag())
                    .getValue();
            assert str != null;
            str = str.replace(" ", "").replace(",", ".");
            double value = Double.parseDouble(str);
            return BigDecimal.valueOf(value).setScale(getDigits(), RoundingMode.HALF_UP);
        });
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
            step.parameter("BigDecimal", value);

            String pattern = ".*\\d.\\d{2}";
            String str = value.toString();
            str = str.replace(".", ",");
            assert str.matches(pattern) : "The number does not match the pattern.";
            clear();
            getFieldByName().click();
            getFieldByName()
                    .$(getValueTag())
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .setValue(str);
            $("body").click();
        });
    }

    public Boolean checkCurrencyValue(String currencySign) {
        return Allure.step("Check a currencySign in a field", step -> {
            logTime(step);
            String currency = getFieldByName().shouldBe(Condition.exist)
                    .$("span")
                    .getText();
            return currency.contains(currencySign);
        });
    }


    @Override
    public Integer getDigits() {
        return Integer.parseInt(getValueByAttribute(1, getValueTag(), "digits"));
    }
}

