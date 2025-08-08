package core.widget.modal.picklist;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Allure;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.StaleElementReferenceException;

@Slf4j
public class PickListModal extends AbstractPickList {
    public PickListModal(String title) {
        super("PickListPopup", title);
    }

    @Override
    protected SelenideElement getIcon() {
        return $("button[class=\"ant-modal-close\"]").shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
    }

    @Override
    protected SelenideElement getCheckBoxAll() {
        return null;
    }

    @Override
    protected SelenideElement getSubmitButton() {
        return null;
    }

    @Override
    protected SelenideElement getSelectionRow(SelenideElement row) {
        return row;
    }

    /**
     * Choosing a value
     *
     * @param value String
     */
    public void setValue(String value) {
        Allure.step("Choosing a value " + value, step -> {
            logTime(step);
            step.parameter("Value", value);

            while (true) {
                boolean valueFound = false;
                if (!widget.is(Condition.visible)) {
                    log.warn("Widget is not visible");
                    break;
                }
                try {
                    waitingForTests.getWaitAllElements(widget);
                    for (SelenideElement row : helper.getListRows()) {
                        if (row.getText().contains(value)) {
                            row.click();
                            valueFound = true;
                            if (!widget.is(Condition.visible)) {
                                log.info("Page disappeared after clicking the row with value '{}'", value);
                            }
                            break;
                        } else {
                            log.info("Value '{}' doesn't match in row '{}'", value, row.getText());
                        }
                    }
                } catch (Exception e) {
                    throw new StaleElementReferenceException("Exception occurred while processing rows", e);
                }
                if (valueFound) {
                    break;
                }
                if (widget.is(Condition.visible)) {
                    if (helper.isLastPage()) {
                        log.info("Reached the last page without finding value '{}'", value);
                        break;
                    } else {
                        log.info("Navigating to the next page");
                        helper.pressRight(1);
                        waitingForTests.getWaitAllElements(widget);
                    }
                } else {
                    log.warn("Widget became invisible before navigating to the next page");
                    break;
                }
            }
        });
    }
}
