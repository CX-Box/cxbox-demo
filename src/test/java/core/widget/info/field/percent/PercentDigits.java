package core.widget.info.field.percent;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.math.BigDecimal;
import java.util.Objects;

public class PercentDigits extends BaseString<BigDecimal> {
    public PercentDigits(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "percent");
    }


    @Override
    public String getValueTag() {
        return "span[class*=\"ReadOnlyField\"]";
    }

    /**
     * Getting a value from a field.
     * Integer
     *
     * @return Integer
     */
    public BigDecimal getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);
            String str = getFieldByName()
                    .shouldBe(Condition.exist)
                    .$(getValueTag())
                    .getText();

            str = str.replace(" ", "").replace(" %", "").replace(" ", "").replace(",", ".");

            return new BigDecimal(str);
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
}
