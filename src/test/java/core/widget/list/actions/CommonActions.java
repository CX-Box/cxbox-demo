package core.widget.list.actions;

import com.codeborne.selenide.CollectionCondition;
import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;
import org.openqa.selenium.By;

public class CommonActions implements Actions {
    private final SelenideElement widget;
    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    public CommonActions(SelenideElement widget) {
        this.widget = widget;
    }

    @Override
    public void click(String actionName) {
        open();
        SelenideElement action = getContainerActions()
                .filterBy(Condition.text(actionName))
                .first()
                .shouldBe(Condition.enabled);
        action.click();
    }

    @Override
    public void clickWithErrors(String actionName) {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<String> getActions() {
        open();
        List<String> actions = getContainerActions().stream().map(SelenideElement::getText).collect(Collectors.toList());
        close();
        return actions;
    }

    private SelenideElement getButton() {
        return getContainer()
                .$(By.cssSelector("button[class^='ant-btn']"))
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout));
    }

    private SelenideElement getContainer() {
        return this.widget
                .shouldBe(Condition.enabled,
                        Duration.ofSeconds(waitingForTests.Timeout))
                .parent().parent().parent().parent()
                .shouldBe(Condition.enabled,
                        Duration.ofSeconds(waitingForTests.Timeout));
    }

    private ElementsCollection getContainerActions() {
        return getContainer()
                .$(By.tagName("ul"))
                .shouldBe(Condition.enabled,
                        Duration.ofSeconds(waitingForTests.Timeout))
                .$$(By.tagName("li"))
                .shouldHave(CollectionCondition.sizeGreaterThan(0));
    }

    private void open() {
        getButton().click();
    }

    private void close() {
        getButton().click();
    }


}
