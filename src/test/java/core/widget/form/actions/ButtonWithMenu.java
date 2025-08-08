package core.widget.form.actions;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Allure;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.openqa.selenium.By;


@RequiredArgsConstructor
public class ButtonWithMenu {

    private final SelenideElement menu;

    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    public ElementsCollection getOptions() {
        return menu.$$(By.tagName("li"));
    }

    /**
     * Selecting an option from the button menu
     *
     * @param nameOption String
     */
    public void clickOption(String nameOption) {
        Allure.step("Selecting the " + nameOption + " option from the button menu", step -> {
            logTime(step);
            step.parameter("nameOption", nameOption);
            getOptions()
                    .find(Condition.text(nameOption))
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });
    }
}
