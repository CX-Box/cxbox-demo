package core.widget.modal.picklist;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.ex.ElementNotFound;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.ListHelper;
import core.widget.filter.ListFilter;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.StaleElementReferenceException;

@Slf4j
public abstract class AbstractPickList {

    protected SelenideElement widget;
    protected SelenideElement field;
    final String typePopup;
    final String title;
    protected ListHelper helper;
    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();


    public AbstractPickList(String typePopup, String title) {
        this.typePopup = typePopup;
        this.title = title;
        SelenideElement modalElement = getModalByName();
        this.field = modalElement;
        if (modalElement != null) {
            this.widget = getModalByName();
            this.helper = new ListHelper(this.widget);
        } else {
            this.widget = null;
            this.helper = null;
        }
    }

    public SelenideElement getModalByName() {
        return $("div[data-test-widget-type='" + typePopup + "'][data-test-widget-title='" + title + "']")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
    }

    /**
     * Pagination.
     * Clicking on the button "Right"
     *
     * @param number Number of clicks
     */
    public void pressRight(int number) {
        Allure.step("Clicking on the button \"Right\"", step -> {
            logTime(step);
            step.parameter("Number of clicks", number);

            for (int i = 0; i < number; i++) {
                if (getPages() > 1) {
                    this.widget.$("i[class=\"anticon anticon-right\"]")
                            .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                            .click();
                }

            }
        });

    }

    /**
     * Checking the last page
     *
     * @return boolean true/false
     */
    public boolean isLastPage() {
        return this.widget
                .$("li[title=\"Next Page\"][aria-disabled=\"true\"]")
                .is(Condition.anyOf(Condition.visible, Condition.enabled));
    }

    /**
     * Getting the number of pages in a pagination
     *
     * @return int Number of pages
     */
    public int getPages() {
        return Allure.step("Getting the number of pages in a pagination", step -> {
            logTime(step);

            return this.widget.$("div[data-test-widget-list-pagination=\"true\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .$$("li[tabindex=\"0\"]").size();
        });
    }

    protected abstract SelenideElement getIcon();

    protected abstract SelenideElement getCheckBoxAll();

    protected abstract SelenideElement getSubmitButton();

    protected abstract SelenideElement getSelectionRow(SelenideElement row);

    /**
     * This method is not available.
     * UnsupportedOperationException
     */
    @Step("Setting the")
    public void setValue() {
        throw new UnsupportedOperationException();
    }

    /**
     * This method is not available.
     * UnsupportedOperationException
     */
    @Step("Setting Values")
    public void setValues(String columnName, List<String> value, Boolean status) {
        throw new UnsupportedOperationException();
    }

    /**
     * This method is not available.
     * UnsupportedOperationException
     */
    @Step("Setting Values with status")
    public void setMultiValue(String columnName, List<String> value, Boolean status) {
        throw new UnsupportedOperationException();
    }

    /**
     * This method is not available.
     * UnsupportedOperationException
     */
    @Step("Filtering")
    public void filter() {
        throw new UnsupportedOperationException();
    }

    /**
     * Checking the sorting in a column
     *
     * @param column Column's name
     * @return Boolean
     */
    @Step("Checking the sorting in a column {column}")
    public Boolean checkSorting(String column) {
        return Allure.step("", step -> {
            logTime(step);
            step.parameter("Column's name", column);

            boolean isColumnFound = false;
            for (SelenideElement c : helper.getColumns()) {
                if (c.getText().equals(column)) {
                    isColumnFound = true;
                    if (!c.$("i[data-test-widget-list-header-column-sort=\"true\"]")
                            .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                            .exists()) {
                        return false;
                    }
                }
            }
            return isColumnFound;
        });

    }

    /**
     * Sorting. If the column has a sorting function.
     *
     * @param column Column's name
     */
    public void setSorting(String column) {
        Allure.step("Column Sorting " + column, step -> {
            logTime(step);

            helper.returnFirstPage();
            try {
                if (checkSorting(column)) {
                    helper.setSorting(column);
                    waitingForTests.getWaitAllElements(widget);
                } else {
                    throw new RuntimeException("Сортировка для столбца " + column + " не найдена. Или недоступна.");
                }
            } catch (Exception e) {
                log.error("Ошибка при установке сортировки для столбца " + column + ": " + e.getMessage());
            }
        });

    }

    /**
     * Getting the column type
     *
     * @param column Column's name
     * @return String
     */
    public String getTypeColumn(String column) {
        return Allure.step("Getting the column type " + column, step -> {
            logTime(step);
            step.parameter("Column's name", column);

            return Objects.requireNonNull(getColumn(column).getAttribute("data-test-widget-list-header-column-type"));
        });

    }

    /**
     * Close window
     */
    public void close() {
        Allure.step("Closing the window", step -> {
            logTime(step);

            getIcon().click();
        });
    }


    /**
     * Getting a list of Column Names
     *
     * @return List String
     */
    public List<String> getColumnName() {
        return Allure.step("Getting a list of Column Names", step -> {
            logTime(step);


            return helper.getColumnNames();
        });
    }

    /**
     * Filtering search for the selected column
     *
     * @param column Column's name
     * @return Filter Sheet
     */
    public ListFilter findFilterColumn(String column) {
        Allure.addAttachment("Column", column);
        return Allure.step("Filtering search for the selected column", step -> {
            logTime(step);
            step.parameter("Column's name", column);

            try {
                if (checkFilterColumn(column)) {
                    getColumn(column)
                            .$("div[data-test-widget-list-header-column-filter=\"true\"]")
                            .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                            .click();
                    return new ListFilter(getTypeColumn(column), column, helper, widget);
                }
            } catch (ElementNotFound e) {
                log.error("Элемент не найден");
            }
            throw new RuntimeException("Фильтр для столбца " + column + " не найден.");
        });
    }

    /**
     * Checking column filtering
     *
     * @param column Column's name
     * @return Boolean true/false
     */
    public Boolean checkFilterColumn(String column) {
        return Allure.step("Checking column filtering " + column, step -> {
            logTime(step);
            step.parameter("Column's name", column);

            return getColumn(column).$("div[data-test-widget-list-header-column-filter=\"true\"]")
                    .is(Condition.visible);
        });
    }

    private SelenideElement getColumn(String columnName) {
        for (SelenideElement c : helper.getColumns()) {
            if (c.getText().equals(columnName)) {
                return c;
            }
        }
        throw new RuntimeException("Столбец " + columnName + " не найден");
    }

    /**
     * Getting a list of lines from all pages
     *
     * @return List String
     */
    public List<String> getListRowsTexts() {
        return Allure.step("Getting a list of lines from all pages", step -> {
            logTime(step);

            List<String> rowTexts = new ArrayList<>();
            Selenide.sleep(200);
            while (true) {
                try {
                    for (SelenideElement row : helper.getListRows()) {
                        rowTexts.add(row.getText());
                    }
                } catch (StaleElementReferenceException e) {
                    for (SelenideElement row : helper.getListRows()) {
                        rowTexts.add(row.getText());
                    }
                }
                if (helper.isLastPage()) {
                    break;
                }
                helper.pressRight(1);
            }
            return rowTexts;
        });

    }
}
