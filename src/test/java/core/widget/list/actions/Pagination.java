package core.widget.list.actions;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.Objects;
import org.openqa.selenium.By;

public class Pagination {

    private final SelenideElement widget;

    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    public Pagination(SelenideElement widget) {
        this.widget = widget;
    }

    private ElementsCollection paginationButtons() {
        String CONTAINER_PAGINATION = "div[data-test-widget-list-pagination=\"true\"]";
        return widget
                .$(CONTAINER_PAGINATION).shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$(By.tagName("li"));
    }

    /**
     * Going to the page
     *
     * @param number Integer page number
     */
    @Step("Going to the page {number}")
    public void setPages(Integer number) {
        paginationButtons()
                .findBy(Condition.text(String.valueOf(number)))
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        waitingForTests.getWaitAllElements(widget);
    }

    /**
     * Go to the previous page
     */
    @Step("Go to the previous page")
    public void pressLeft() {
        paginationButtons()
                .find(Condition.attribute("title", "Previous Page"))
                .click();
        waitingForTests.getWaitAllElements(widget);
    }

    /**
     * Go to the next page
     */
    @Step("Go to the next page")
    public void pressRight() {
        paginationButtons()
                .find(Condition.attribute("title", "Next Page"))
                .click();
        waitingForTests.getWaitAllElements(widget);
    }

    /**
     * Setting the number of rows in the table
     *
     * @param number Integer the number of rows, a multiple of 5
     */
    @Step("Setting the number of rows in the table to {number}")
    public void setLimitRowsPages(Integer number) {
        $("div[class*=\"Pagination__limits\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        $("ul[class=\"ant-select-dropdown-menu  ant-select-dropdown-menu-root ant-select-dropdown-menu-vertical\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$(By.tagName("li"))
                .findBy(Condition.text(String.valueOf(number)))
                .click();
        waitingForTests.getWaitAllElements(widget);

    }

    /**
     * Getting the active page number
     *
     * @return Integer или null
     */
    @Step("Getting the active page number")
    public Integer getActivePages() {
        for (SelenideElement button : paginationButtons()) {
            if (Objects.requireNonNull(button.getAttribute("class")).contains("ant-pagination-item-active")) {
                return Integer.parseInt(Objects.requireNonNull(button.getAttribute("title")));
            }
        }
        return null;
    }
}
