package core.widget.modal.error;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.SelenideElement;
import core.widget.modal.BasePopup;
import io.qameta.allure.Allure;

public class ErrorPopup extends BasePopup<String> {
    public ErrorPopup() {
        super("error");
    }

    @Override
    public SelenideElement findPopup() {
        return $("div[data-test-" + typePopup + "-popup=\"true\"]");
    }

    /**
     * Getting the title of a modal window
     *
     * @return String title text
     */
    public String getTitle() {
        return Allure.step("Getting the header value", step -> {
            logTime(step);

            return getTextElement(" header span");
        });
    }

    /**
     * Getting the message text
     *
     * @return String message text
     */
    public String getMessage() {
        return Allure.step("Getting the message text", step -> {
            logTime(step);

            return getTextElement("span[class=\"ant-form-item-children\"]");
        });
    }

}
