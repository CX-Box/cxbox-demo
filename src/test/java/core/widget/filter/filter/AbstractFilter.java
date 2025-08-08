package core.widget.filter.filter;


import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.ListHelper;
import core.widget.modal.Popup;
import java.time.Duration;
import java.util.Optional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public abstract class AbstractFilter<E> {
    SelenideElement formFilter = $("div[class*=\"ant-popover ant-popover-placement\"]");

    final String columnType;

    final String columnName;

    final ListHelper helper;

    public abstract void setFilter(E value);

    public void setFilter(E value, E secondValue) {
        throw new UnsupportedOperationException("setFilter(value, secondValue) is not supported by default");
    }

    public abstract String getTypeFilter();

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    /**
     * Filter application button
     */
    public void setApply() {
        $("button[data-test-filter-popup-apply=\"true\"]")
                .shouldBe(Condition.exist)
                .click();
    }

    /**
     * The filter cleaning button. After clicking, the window closes.
     */
    public void setClear() {
        $("button[data-test-filter-popup-clear=\"true\"]")
                .shouldBe(Condition.exist)
                .click();
    }

    private SelenideElement buttonPopup() {
        return formFilter.$("button[class=\"ant-btn ant-btn-icon-only\"]")
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout));
    }

    public Optional<Popup> findPopup() {
        if (buttonPopup().is(Condition.exist)) {
            buttonPopup().click();
            return Optional.of(new Popup());
        } else {
            return Optional.empty();
        }
    }


}
