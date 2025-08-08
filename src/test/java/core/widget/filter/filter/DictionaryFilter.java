package core.widget.filter.filter;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import java.time.Duration;
import java.util.List;
import org.openqa.selenium.By;

public class DictionaryFilter extends AbstractFilter<String> {
    public DictionaryFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }

    @Override
    public void setFilter(String value) {
        getOptionDictionary(value)
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .$(By.tagName("label"))
                .click();
        setApply();
    }

    public List<String> getFilters() {
        List<String> filters = getOptionsDictionary().stream().map(SelenideElement::getText).toList();
        setApply();
        return filters;
    }

    @Override
    public String getTypeFilter() {
        return "dictionary";
    }

    private SelenideElement getOptionDictionary(String value) {
        return getOptionsDictionary()
                .find(Condition.match("check action name: " + value, b -> b.getText().equals(value)))
                .scrollIntoView("{block: \"center\"}");
    }

    private ElementsCollection getOptionsDictionary() {
        return $("form[class=\"ant-form ant-form-vertical\"]")
                .$$(By.tagName("li"));
    }

    public void setApply() {
        $("div[class=\"ant-popover-inner-content\"]")
                .$("button[data-test-filter-popup-apply=\"true\"]")
                .shouldBe(Condition.visible)
                .click();
    }
}
