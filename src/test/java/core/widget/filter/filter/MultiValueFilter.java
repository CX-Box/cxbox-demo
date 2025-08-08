package core.widget.filter.filter;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.modal.Popup;
import java.time.Duration;
import java.util.Optional;

public class MultiValueFilter extends AbstractFilter<String> {
    public MultiValueFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }

    @Override
    public void setFilter(String value) {
        throw new UnsupportedOperationException("First findPopup");
    }

    @Override
    public String getTypeFilter() {
        return "multivalue";
    }

    public Optional<Popup> findPopup() {
        SelenideElement elementPopup = $("div[data-test-widget-type=\"AssocListPopup\"]")
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout));
        if (elementPopup.is(Condition.exist)) {
            return Optional.of(new Popup());
        } else {
            return Optional.empty();
        }
    }
}
