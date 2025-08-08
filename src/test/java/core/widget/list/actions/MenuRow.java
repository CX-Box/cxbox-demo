package core.widget.list.actions;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.List;

public class MenuRow {

    private final SelenideElement MENU = $("ul[class=\"ant-dropdown-menu ant-dropdown-menu-light ant-dropdown-menu-root ant-dropdown-menu-vertical\"]");

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    private ElementsCollection optionsMenuRow() {
        waitingForTests.getWaitAllElements(MENU);
        return MENU
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("li[data-test-widget-list-row-action-item=\"true\"]");
    }

    /**
     * Getting a list of options from the line menu
     *
     * @return List String
     */
    @Step("Getting a list of options from the line menu")

    public List<String> getListOptionsMenuRow() {
        return optionsMenuRow().texts();

    }

    /**
     * Clicking on an option in the line menu
     *
     * @param actionName Name of the option
     */
    @Step("Clicking on the {actionName} option in the line menu")
    public void clickOption(String actionName) {
        for (SelenideElement option : optionsMenuRow()) {
            if (option.getText().equals(actionName)) {
                option
                        .scrollIntoView("{block: \"center\"}")
                        .click();
            }
        }
    }
}
