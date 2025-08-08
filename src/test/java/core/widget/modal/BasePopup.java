package core.widget.modal;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import java.time.Duration;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.openqa.selenium.By;

@RequiredArgsConstructor
public abstract class BasePopup<E> {
    protected E typePopup;

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    public BasePopup(E typePopup) {
        this.typePopup = typePopup;
    }

    public abstract SelenideElement findPopup();

    /**
     * Closing the modal window via a cross
     */
    public void close() {
        findPopup().$("span[class=\"ant-modal-close-x\"]")
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
    }

    /**
     * Clicking on the button by Name
     *
     * @param actionName Button's name
     */
    public void clickButton(String actionName) {
        SelenideElement button = getButton(actionName);
        button.shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout)).click();
    }

    /**
     * Clicking on the button Ok
     */
    public void clickOk() {
        clickButton("Ok");
    }

    /**
     * Clicking on the button Cancel
     */
    public void clickCancel() {
        clickButton("Cancel");
    }

    /**
     * Displaying a list of all buttons in a widget
     *
     * @return List<String>
     */
    public List<String> getButtons() {
        return getContainersActions().texts();
    }

    private SelenideElement getContainer() {
        return findPopup()
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .scrollIntoView("{block: \"center\"}");
    }

    private ElementsCollection getContainersActions() {
        return getContainer()
                .$$(By.tagName("button"))
                .shouldBe(CollectionCondition.sizeGreaterThan(0));
    }

    private SelenideElement getButton(String actionName) {
        return getContainersActions()
                .find(Condition.match("check action name: " + actionName, b -> b.getText().equals(actionName)));
    }

    /**
     * Getting the element text
     *
     * @param locator Element Locator
     * @return String
     */
    public String getTextElement(String locator) {
        return findPopup()
                .$(locator)
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
    }
}
