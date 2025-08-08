package core.widget.modal.picklist;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.form.FormWidget;
import io.qameta.allure.Allure;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.openqa.selenium.By;

@RequiredArgsConstructor
public class FormPopup {

    protected final SelenideElement widget;

    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    /**
     * Getting the Popup Header
     *
     * @return String
     */
    public String getNameFormPopup() {
        return widget
                .$("div[class=\"ant-modal-title\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
    }

    private ElementsCollection getButtons() {
        return widget.$$(By.tagName("button"));
    }

    /**
     * Clicking on the button by name
     *
     * @param nameButton The name of the button or the text in it
     */
    public void clickButton(String nameButton) {
        Allure.step("Clicking on the button " + nameButton, step -> {
            logTime(step);
            step.parameter("Name button", nameButton);

            getButtons().findBy(Condition.text(nameButton)).click();
        });
    }

    /**
     * Calling FormWidget to access the base fields
     *
     * @return FormWidget
     */
    public FormWidget getFieldByName() {
        return Allure.step("Calling FormWidget to access the base fields", step -> {
            logTime(step);

            return new FormWidget(null, widget);
        });
    }
}
