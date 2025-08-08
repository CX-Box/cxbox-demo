package core.widget.info.field.number;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;

public class Number extends BaseString<Integer> {

    public Number(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "number");
    }

    /**
     * Getting a value from a field. Integer only
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
            str = str.replace(" ", "").replace(",00", "").replace(" ", "");
            return Integer.parseInt(str);
        });
    }

    @Override
    public String getValueTag() {
        return "span[class*=\"ReadOnlyField\"]";
    }
}
