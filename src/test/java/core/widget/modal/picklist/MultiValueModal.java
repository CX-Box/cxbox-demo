package core.widget.modal.picklist;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.*;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.apache.commons.lang3.tuple.Pair;
import org.openqa.selenium.By;


public class MultiValueModal extends AbstractPickList {
    public MultiValueModal(String title) {
        super("AssocListPopup", title);
    }

    @Override
    protected SelenideElement getIcon() {
        return null;
    }

    @Override
    protected SelenideElement getCheckBoxAll() {
        return this.widget
                .$("thead[class=\"ant-table-thead\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$("th[class=\"ant-table-selection-column\"]")
                .$(By.tagName("input"));
    }

    @Override
    protected SelenideElement getSubmitButton() {
        return this.widget
                .$("button[data-test-widget-list-close=\"true\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
    }

    @Override
    protected SelenideElement getSelectionRow(SelenideElement row) {
        return row.$(By.cssSelector("td[class='ant-table-selection-column']"))
                .$(By.tagName("input"))
                .shouldBe(Condition.enabled);
    }

    /**
     * Setting the list of values with pre-clearing of the field.
     *
     * @param columnName Table's name
     * @param value      List String list of values
     * @param status     Boolean true/false
     */
    @Override
    public void setValues(String columnName, List<String> value, Boolean status) {
        Allure.step("Setting the list of values", step -> {
            logTime(step);
            step.parameter("Table's name", columnName);
            step.parameter("List string of values", value);
            step.parameter("Status", status);

            clear();
            setMultiValue(columnName, value, status);
            close();
        });
    }

    /**
     * Setting a single value
     *
     * @param value  String value
     * @param status Boolean true/false
     */
    public void setValue(String value, Boolean status) {
        Allure.step("Setting the " + value + " value to " + status, step -> {
            logTime(step);
            step.parameter("Value", value);
            step.parameter("Status", status);

            while (true) {
                getColumnName().forEach(column -> setValuesOnCurrentPage(column, Collections.singletonList(value), status));
                if (isLastPage()) {
                    break;
                }
                pressRight(1);
            }
            close();
        });

    }

    /**
     * Setting multiple values, without clearing the field
     *
     * @param columnName Table's name
     * @param value      List String list of values
     * @param status     Boolean true/false
     */
    @Override
    public void setMultiValue(String columnName, List<String> value, Boolean status) {
        Allure.step("Setting multiple values, without clearing the field", step -> {
            logTime(step);
            step.parameter("Table's name", columnName);
            step.parameter("Value", value);
            step.parameter("Status", status);

            while (true) {
                setValuesOnCurrentPage(columnName, value, status);
                if (isLastPage()) {
                    break;
                }
                pressRight(1);
                Selenide.sleep(200);
            }
        });

    }

    private void setValuesOnCurrentPage(String columnName, List<String> values, Boolean status) {
        helper.getListRows()
                .shouldBe(CollectionCondition.sizeGreaterThan(0))
                .stream()
                .filter(r -> values.contains(helper.getColumnByName(columnName, r).getText()))
                .forEach(row -> {
                    if (getSelectionRow(row).shouldBe(Condition.enabled).isSelected() == status) {
                        getSelectionRow(row).click();
                    }
                    if (!getSelectionRow(row).shouldBe(Condition.enabled).isSelected() == status) {
                        getSelectionRow(row).click();
                    }
                });
    }

    /**
     * Setting all values
     */
    public void setValueAll() {
        Allure.step("Setting all values", step -> {
            logTime(step);

            while (true) {
                getCheckBoxAll().click();

                if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                    return;
                }

                if (isLastPage()) {
                    break;
                }

                pressRight(1);
                Selenide.sleep(200);
            }
        });
    }

    public List<String> getColumnName() {
        return helper.getColumnNames();
    }

    /**
     * Clearing the field
     */
    public void clear() {
        Allure.step("Clearing the field", step -> {
            logTime(step);

            ElementsCollection icons = this.widget
                    .$("div[class=\"ant-modal-title\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .$$("i[aria-label=\"icon: close\"]");
            List<SelenideElement> listIcons = new ArrayList<>(icons.stream().toList());
            Collections.reverse(listIcons);
            for (SelenideElement i : listIcons) {
                i.shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
                waitingForTests.getWaitAllElements(i);
                i.click();
            }
        });

    }

    /**
     * Getting all the values from the status column
     *
     * @param columnName Column's name
     * @return List Pair Boolean String статус и имя
     */
    public List<Pair<Boolean, String>> getStatusValue(String columnName) {
        Allure.addAttachment("Column", columnName);
        return Allure.step("Getting all values from the " + columnName + " column with the status", step -> {
            logTime(step);
            step.parameter("Column's name", columnName);

            List<Pair<Boolean, String>> statusAndNames = new ArrayList<>();
            while (true) {
                helper.getListRows()
                        .shouldBe(CollectionCondition.sizeGreaterThan(0))
                        .stream()
                        .forEach(row -> {
                            Boolean status = getSelectionRow(row).isSelected();
                            String name = helper.getColumnByName(columnName, row).getText();
                            statusAndNames.add(Pair.of(status, name));
                        });
                if (isLastPage()) {
                    break;
                }
                pressRight(1);
                Selenide.sleep(200);
            }
            return statusAndNames;
        });

    }

    /**
     * Clicking on the button Close
     */
    public void close() {
        Allure.step("Clicking on the button Close", step -> {
            logTime(step);

            getSubmitButton()
                    .click();
        });

    }
}
