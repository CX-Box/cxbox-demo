package core.widget.modal.confirm;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.SelenideElement;
import core.widget.modal.BasePopup;
import io.qameta.allure.Allure;

public class ConfirmPopup extends BasePopup<String> {

    public ConfirmPopup() {
        super("confirm");
    }

    /**
     * Getting the header value
     *
     * @return String
     */
    public String getTitle() {
        return Allure.step("Getting the header value", step -> {
            logTime(step);

            return getTextElement("div[class=\"ant-modal-title\"]");
        });

    }

    /**
     * Getting the message text
     *
     * @return String
     */
    public String getMessage() {
        return Allure.step("Getting the message text", step -> {
            logTime(step);

            return getTextElement("p");
        });
    }

    @Override
    public SelenideElement findPopup() {
        return $("[data-test-" + typePopup + "-popup=\"true\"]");
    }
}
