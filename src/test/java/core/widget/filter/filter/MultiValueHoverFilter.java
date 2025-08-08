package core.widget.filter.filter;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.modal.Popup;
import java.time.Duration;
import java.util.Optional;

public class MultiValueHoverFilter extends AbstractFilter<String> {
    public MultiValueHoverFilter(String columnType, String columnName, ListHelper helper) {
        super(columnType, columnName, helper);
    }

    @Override
    public void setFilter(String value) {
        selectFilter(value);

        setApply();
    }

    @Override
    public String getTypeFilter() {
        return "multivalueHover";
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

    public void selectFilter(String value) {
        Selenide.sleep(500);
        $("div.ant-modal-body").shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$((" [data-test-widget-list-row-id]")).forEach(row -> {

                    SelenideElement customFieldCell = row.$("div[data-test-field-key='customField'] span")
                            .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));

                    if (customFieldCell.getText().contains(value)) {
                        SelenideElement checkbox = row.$("input[type='checkbox']")
                                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout));
                        if (!checkbox.isSelected()) {
                            checkbox.click();
                        }
                    }
                });
    }

    @Override
    public void setApply() {
        $("button[data-test-widget-list-save=\"true\"]")
                .shouldBe(Condition.exist)
                .click();
    }
}
