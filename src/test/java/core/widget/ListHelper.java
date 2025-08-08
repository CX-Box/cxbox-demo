package core.widget;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import com.google.common.base.Preconditions;
import core.OriginExpectations.CxBoxExpectations;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;

@Getter
@Slf4j
public class ListHelper {
    private final SelenideElement widget;

    private final CxBoxExpectations waitingForTest = new CxBoxExpectations();


    public ListHelper(SelenideElement widget) {
        this.widget = widget;
    }


    public List<String> getColumnNames() {
        for (int i = 1; i < waitingForTest.RetryNumber; i++) {
            try {
                return this.widget
                        .$(By.tagName("table"))
                        .$(By.tagName("thead"))
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTest.Timeout))
                        .$$(By.tagName("th"))
                        .stream()
                        .map(th -> th.getAttribute("data-test-widget-list-header-column-title"))
                        .collect(Collectors.toList());
            } catch (StaleElementReferenceException ex) {
                log.error("Stale element reference exception occurred while getting column names. Retrying...{}", i, ex);
            }
        }
        throw new RuntimeException("Time is over...");
    }

    public ElementsCollection getColumns() {
        return this.widget
                .$(By.tagName("table"))
                .$(By.tagName("thead"))
                .shouldBe(Condition.visible)
                .$$(By.tagName("th"));
    }

    public ElementsCollection getListRows() {
        try {
            waitingForTest.getWaitAllElements(widget);
            return this.widget
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTest.Timeout))
                    .$$(By.cssSelector("table > tbody > tr"));
        } catch (StaleElementReferenceException e) {
            log.error("The element is outdated: {}", e);
            return null;
        }
    }

    public List<String> getColumnValuesByColumnName(String fieldName) {
        try {
            waitingForTest.getWaitAllElements(widget);
            ElementsCollection rows = this.widget
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTest.Timeout))
                    .$$(By.cssSelector("table > tbody > tr"));

            List<String> columnValues = new ArrayList<>();
            for (SelenideElement row : rows) {
                SelenideElement cell = row.$(By.cssSelector("td > div[data-test-field-title='" + fieldName + "']"));
                if (cell.exists()) {
                    columnValues.add(cell.getText().trim());
                }
            }
            return columnValues;

        } catch (StaleElementReferenceException e) {
            log.error("The element is outdated: {}", e);
            return null;
        }
    }

    public SelenideElement getColumnByName(String columnName, SelenideElement row) {
        for (var i = 1; i <= waitingForTest.RetryNumber; i++) {
            try {
                SelenideElement column = row.$$(By.tagName("td"))
                        .get(getColumnNumber(columnName, getColumnNames()))
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTest.Timeout));
                if (column.exists()) {
                    return column;
                }
            } catch (StaleElementReferenceException ex) {
                log.error("The element is outdated. Attempt number: {}", i, ex);
            }
        }
        throw new RuntimeException("Time is over...");
    }

    private int getColumnNumber(String columnName, List<String> columnNames) {
        waitingForTest.getWaitAllElements(widget);
        Preconditions.checkNotNull(columnNames, "columnNames must not be null");
        int number = columnNames.indexOf(columnName);
        Preconditions.checkArgument(number >= 0, "No column with name '%s' found", columnName);
        return number;
    }

    public void setSorting(String column) {
        for (SelenideElement c : getColumns()) {
            if (c.getText().equals(column)) {
                SelenideElement sortIcon = c.$("div[data-test-widget-list-header-column-sort=\"true\"] i.anticon-caret-up");
                sortIcon.shouldBe(Condition.exist, Duration.ofSeconds(waitingForTest.Timeout))
                        .hover();
                sortIcon.shouldBe(Condition.visible, Duration.ofSeconds(waitingForTest.Timeout))
                        .click();
                break;
            }
        }
    }

    public boolean isLastPage() {
        waitingForTest.getWaitAllElements(widget);
        return this.widget
                .$("li[title=\"Next Page\"][aria-disabled=\"true\"]")
                .is(Condition.anyOf(Condition.visible, Condition.enabled));
    }

    public int getPages() {
        return this.widget.$("div[data-test-widget-list-pagination=\"true\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTest.Timeout))
                .$$("li[tabindex=\"0\"]").size();
    }

    public void pressRight(int number) {
        for (int i = 0; i < number; i++) {
            if (getPages() > 1) {
                waitingForTest.getWaitAllElements(widget);
                this.widget.$("i[class=\"anticon anticon-right\"]")
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTest.Timeout))
                        .scrollIntoView("{ block: \"center\", behavior: \"smooth\" }")
                        .click();
                waitingForTest.getWaitAllElements(widget);
            }
        }
    }

    private void pressFirstPages() {
        this.widget
                .$("div[data-test-widget-list-pagination=\"true\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTest.Timeout))
                .$("li[title=\"1\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTest.Timeout))
                .click();
    }

    public void returnFirstPage() {
        if (isLastPage()) {
            pressFirstPages();
        }
    }
}
