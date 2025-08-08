package core.widget.info.field.percent;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;

public class Percent extends BaseString<Integer> {
    public Percent(InfoWidget infoWidget, String title) {
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
    public Integer getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            String str = getFieldByName()
                    .shouldBe(Condition.exist)
                    .$(getValueTag())
                    .getText();
            str = str.replace(" ", "").replace(" %", "").replace(" ", "");
            return Integer.parseInt(str);
        });
    }

}
