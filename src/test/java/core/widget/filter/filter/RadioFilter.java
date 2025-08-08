package core.widget.filter.filter;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import java.time.Duration;

public class RadioFilter extends AbstractFilter<String> {
    public RadioFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }

    @Override
    public void setFilter(String nameRadio) {
        getRadio(nameRadio)
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        setApply();
    }

    @Override
    public String getTypeFilter() {
        return "radio";
    }


    private SelenideElement getRadio(String nameRadio) {
        return getContainersActions().find(Condition.match("check action name: " + nameRadio, b -> b.getAttribute("value").equals(nameRadio)));
    }

    private ElementsCollection getContainersActions() {
        return formFilter.$("form[class=\"ant-form ant-form-vertical\"]")
                .$$("input")
                .shouldHave(CollectionCondition.sizeGreaterThan(0));
    }
}
