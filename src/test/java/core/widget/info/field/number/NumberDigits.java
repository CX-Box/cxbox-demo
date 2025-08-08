package core.widget.info.field.number;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import java.math.BigDecimal;
import java.math.RoundingMode;


public class NumberDigits extends BaseString<BigDecimal> {
    public NumberDigits(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "number");
    }

    public Integer getDigits() {
        return getFieldByName().$("span span").getText().split(",")[1].length();
    }

    /**
     * Getting the value from the field.
     * Any numbers
     *
     * @return BigDecimal
     */
    public BigDecimal getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            String str = getFieldByName()
                    .shouldBe(Condition.exist)
                    .$(getValueTag())
                    .getText();
            assert str != null;
            str = str.replace(" ", "").replace(",", ".");
            double value = Double.parseDouble(str);
            return BigDecimal.valueOf(value).setScale(getDigits(), RoundingMode.HALF_UP);
        });
    }

    public String getValueTag() {
        return "div.span.div.span";
    }

}
