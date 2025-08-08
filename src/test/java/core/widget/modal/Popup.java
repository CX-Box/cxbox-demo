package core.widget.modal;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.list.RowsHelper;
import core.widget.modal.confirm.ConfirmPopup;
import core.widget.modal.error.ErrorPopup;
import core.widget.modal.picklist.MultiValueModal;
import core.widget.modal.picklist.PickListModal;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;

public class Popup {
    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    /**
     * Modal error window
     *
     * @return ErrorPopup
     */
    @Step("Calling Error Popup")
    public ErrorPopup errorPopup() {
        return new ErrorPopup();
    }

    /**
     * Modal confirmation window
     *
     * @return ConfirmPopup
     */
    @Step("Calling Confirm Popup")
    public ConfirmPopup confirmPopup() {
        return new ConfirmPopup();
    }

    /**
     * Initialization of the modal window PickList by title
     *
     * @param title String Title
     * @return PickListPopup
     */
    @Step("Calling PickList Popup")
    public PickListModal pickListPopupForSetValue(String title) {
        return new PickListModal(title);
    }

    /**
     * Initialization of the modal window MultiValue by title
     *
     * @param title String Title
     * @return MultiValuePopup
     */
    @Step("Calling MultiValue Popup")
    public MultiValueModal multiValueModal(String title) {
        return new MultiValueModal(title);
    }

    /**
     * Initialization of the modal window FilterGroupSettingsPopup
     *
     * @return FilterGroupSettingsPopup
     */
    @Step("Calling FilterGroupSettingsPopup")
    public FilterGroupSettingsPopup filterGroupSettingsPopup() {
        return new FilterGroupSettingsPopup();
    }

    /**
     * Calling a modal window with line editing function
     *
     * @param title Title
     * @return RowsHelper
     */
    public RowsHelper picklistPopup(String title) {
        return Allure.step("Calling Picklist Popup with row editing function", step -> {
            logTime(step);
            step.parameter("Title", title);

            SelenideElement widget = findWidgetByTypesAndTitle("PickListPopup", title);
            return new RowsHelper(title, widget);
        });

    }

    private SelenideElement findWidgetByTypesAndTitle(String type, String title) {
        return $("div[data-test='WIDGET'][data-test-widget-type='" + type + "'][data-test-widget-title='" + title
                + "']")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout));
    }
}
