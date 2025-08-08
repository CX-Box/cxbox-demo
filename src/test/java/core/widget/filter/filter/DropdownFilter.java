package core.widget.filter.filter;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import java.time.Duration;
import org.openqa.selenium.By;

public class DropdownFilter {
    SelenideElement widget;

    SelenideElement DROPDOWN_MENU = $("div[class*=\"ant-select-dropdown ant-select-dropdown--single\"]");

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    public DropdownFilter(SelenideElement widget) {
        this.widget = widget;
    }

    /**
     * Setting the filter
     *
     * @param value String
     */
    public void setValue(String value) {
        widget
                .$("div[class*=\"TableWidget__filtersContainer\"]")
                .$("div[class*=\"ant-select\"]")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        DROPDOWN_MENU.shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$(By.tagName("li"))
                .findBy(Condition.text(value))
                .click();
        waitingForTests.getWaitAllElements(widget);
    }

    /**
     * Getting Filter options
     *
     * @return String
     */
    public String getOptions() {
        widget.$("div[class*=\"TableWidget__filtersContainer\"]")
                .$("div[class=\"ant-select ant-select-enabled\"]")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        return String.valueOf(DROPDOWN_MENU.shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout)).$$(By.tagName("li")).texts());
    }

    /**
     * Getting the filter value
     *
     * @return String
     */
    public String getValue() {
        return widget
                .$("div[class*=\"TableWidget__filtersContainer\"]")
                .$("div[class=\"ant-select ant-select-enabled\"]")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .getText();
    }


}
