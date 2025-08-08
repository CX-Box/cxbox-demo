package application.widget.dictionaryAdministration;

import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selectors.byText;
import static com.codeborne.selenide.Selenide.*;
import static core.widget.modal.Calendar.waitingForTests;

import com.codeborne.selenide.*;
import core.widget.ListHelper;
import core.widget.groupingHierarchy.GroupingHierarchyWidget;
import core.widget.list.field.dictionary.FileRow;
import core.widget.modal.Popup;
import io.qameta.allure.Step;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;
import org.openqa.selenium.By;

public class DictionaryAdministration extends GroupingHierarchyWidget {

    public DictionaryAdministration(String title, SelenideElement widget, ListHelper helper) {
        super(title, widget, helper);
    }

    public DictionaryAdministration(SelenideElement widget, String title) {
        super(widget, title);
    }

    public void selectRowByName(String rowName) {
        getWidget().$(By.cssSelector("tr[data-test-widget-list-row-type='GroupingRow'][data-row-key='" + rowName + "']")).$(By.cssSelector("i[aria-label='icon: up'")).click();
    }

    public void createValue(String type, String key, String value, Integer order) {
        clickButton("Create");
        selectType(type);
        fillTheField(key, "Key");
        fillTheField(value, "Value");
        fillTheField(order.toString(), "Order");
        clickButton("Save");
    }

    public void delete(String type, String key) {
        selectRowByName(type);

        SelenideElement keyCell = getWidget().$$("td")
                .findBy(text(key))
                .shouldBe(visible);

        SelenideElement row = keyCell.closest("tr");

        executeJavaScript(
                "const evt = new MouseEvent('mouseover', { bubbles: true }); arguments[0].dispatchEvent(evt);",
                row
        );

        SelenideElement actionButton = $("button[data-test-widget-list-row-action=\"true\"]")
                .shouldBe(visible, Duration.ofSeconds(waitingForTests.Timeout));

        actionButton
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .hover()
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .click();

        getWidget().$("i[aria-label=\"icon: delete\"]").click();
        clickButton("Clear Cache");
    }

    public void clickButton(String buttonName) {
        getWidget().$(byText(buttonName)).parent().click();
    }

    @Step("Validation of the modal window")
    public Optional<Popup> findPopup() {
        SelenideElement elementPopup = $("div[data-test-widget-type=\"PickListPopup\"]")
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout));
        if (elementPopup.is(Condition.exist)) {
            return Optional.of(new Popup());
        } else {
            return Optional.empty();
        }
    }

    public void selectType(String value) {
        getWidget().$("i[aria-label='icon: paper-clip']").click();
        Optional<Popup> popup = findPopup();
        SelenideElement popupRoot = popup.get().picklistPopup("Dictionary Type").getWidget();

        boolean isFound = false;

        while (true) {
            ElementsCollection rows = popupRoot.$$("[data-test-widget-list-row-type='Row']");

            for (SelenideElement row : rows) {
                SelenideElement typeCell = row.$("td > div[data-test-field-key='type']");
                if (typeCell.exists() && typeCell.getText().trim().equals(value)) {
                    typeCell.click();
                    isFound = true;
                    break;
                }
            }

            if (isFound) break;

            SelenideElement nextPage = popupRoot.$(".ant-pagination-next");
            if (nextPage.has(Condition.attribute("aria-disabled", "true"))) {
                break;
            }

            nextPage.scrollTo().click();
            Selenide.sleep(200);
        }

        if (!isFound) {
            throw new NoSuchElementException("Значение '" + value + "' не найдено в столбце 'Type'.");
        }
    }


    public void fillTheField(String value, String columnName) {
        SelenideElement field = getWidget().$("div.ant-row[data-test-field-title='" + columnName + "']");
        field.$("input.ant-input").setValue(value);
    }

    public SelenideElement findRowByKey(String key) {
        return getWidget().$(byText(key)).getSelectedOption();

    }

    public List<FileRow> downloadExportFile(String buttonName) throws IOException {
        File csvFile = getWidget().$(byText(buttonName)).parent().download(DownloadOptions.using(FileDownloadMode.FOLDER));

        List<String> lines = Files.readAllLines(csvFile.toPath()).stream()
                .filter(line -> !line.trim().isEmpty())
                .toList();

        return lines.stream().skip(1)
                .map(FileRow::fromCsv)
                .collect(Collectors.toList());
    }

    public boolean checkExportSort(List<FileRow> list) {
        List<FileRow> sorted = new ArrayList<>(list);
        sorted.sort(Comparator.comparing((FileRow r) -> r.TYPE)
                .thenComparingInt(r -> r.DISPLAY_ORDER));
        return sorted.equals(list);
    }


}
