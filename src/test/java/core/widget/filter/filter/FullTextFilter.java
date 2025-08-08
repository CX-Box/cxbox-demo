package core.widget.filter.filter;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import java.time.Duration;


public class FullTextFilter {

    final SelenideElement widget;

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    public FullTextFilter(SelenideElement widget) {
        this.widget = widget;
    }

    /**
     * Entering a value in the filter's field
     *
     * @param value String
     */
    public void setValue(String value) {
        widget
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$("input[class=\"ant-input\"]")
                .setValue(value);
        waitingForTests.getWaitAllElements(widget);
    }

    public String getValue() {
        return widget
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$("input[class=\"ant-input\"]")
                .getValue();
    }

    /**
     * Очистка фильтра
     */
    public void clear() {
        widget
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$("input[class=\"ant-input\"]")
                .clear();
    }
}
