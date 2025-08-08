package core.widget.list;

import static com.codeborne.selenide.Selenide.$;
import static java.lang.String.format;

import com.codeborne.selenide.*;
import core.OriginExpectations.CxBoxExpectations;
import core.OriginExpectations.ExpectationPattern;
import core.OriginExpectations.ExpectationsFactoryProvider;
import core.widget.ListHelper;
import core.widget.TestingTools.CellManager;
import core.widget.TestingTools.CellProcessor;
import core.widget.TestingTools.ExcelComparator;
import core.widget.addfiles.AddFiles;
import core.widget.filter.GearMenu;
import core.widget.filter.ListFilter;
import core.widget.filter.filter.DropdownFilter;
import core.widget.filter.filter.FullTextFilter;
import core.widget.form.FormWidget;
import core.widget.list.actions.Actions;
import core.widget.list.actions.CommonActions;
import core.widget.list.actions.Pagination;
import core.widget.list.field.checkbox.CheckBoxCell;
import core.widget.list.field.date.DateCell;
import core.widget.list.field.date.DateTimeCell;
import core.widget.list.field.date.DateTimeWithSecondsCell;
import core.widget.list.field.dictionary.DictionaryCell;
import core.widget.list.field.fileupload.FileUploadCell;
import core.widget.list.field.hint.HintCell;
import core.widget.list.field.input.InputCell;
import core.widget.list.field.money.MoneyCell;
import core.widget.list.field.multifield.MultiFieldCell;
import core.widget.list.field.multipleselect.MultipleSelectCell;
import core.widget.list.field.multivalue.MultiValueCell;
import core.widget.list.field.multivaluehover.MultiValueHoverCell;
import core.widget.list.field.number.NumberCell;
import core.widget.list.field.percent.PercentCell;
import core.widget.list.field.picklist.InlinePickListCell;
import core.widget.list.field.picklist.PickListCell;
import core.widget.list.field.radio.RadioCell;
import core.widget.list.field.text.TextCell;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;


@RequiredArgsConstructor
@Getter
@Slf4j
public class RowsHelper {
    private final String title;
    private final SelenideElement widget;
    private final Actions commonActions;
    private final ListHelper helper;
    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();


    public RowsHelper(String title, SelenideElement widget) {
        this.title = title;
        this.widget = widget;
        this.commonActions = new CommonActions(this.widget);
        this.helper = new ListHelper(this.widget);
    }

    /**
     * Getting a list of Column Headings
     *
     * @return List String
     */
    @Step("Getting a list of Column Headings")
    public List<String> getColumnNames() {
        return helper.getColumnNames();
    }

    /**
     * Getting a list of lines from the current page
     *
     * @return List String
     */
    @Step("Getting a list of lines from the current page")
    public List<String> getListRows() {
        waitingForTests.getWaitAllElements(widget);
        return helper.getListRows().texts().stream()
                .map(s -> s
                        .replace("\t", "")
                        .replace("\n", "")
                        .replace(" ", ""))
                .collect(Collectors.toList());
    }

    /**
     * Getting a list of lines from the current page
     *
     * @return List String
     */
    @Step("Getting a list of lines from the current page") //TODO убрать getNoFocus
    public List<String> getListRowsByColumnName(String columnName) {
        waitingForTests.getWaitAllElements(widget);
        return helper.getColumnValuesByColumnName(columnName).stream()
                .map(s -> s
                        .replace("\t", "")
                        .replace("\n", "")
                        .replace(" ", ""))
                .collect(Collectors.toList());
    }

    /**
     * Getting a list of Row IDs from the current page
     *
     * @return List Long
     */
    @Step("Getting a list of lines from the current page")
    public List<Long> getListRowsId() {
        waitingForTests.getWaitAllElements(widget);
        List<Long> list = new ArrayList<>();
        for (SelenideElement row : helper.getListRows()) {
            String attribute = row.getAttribute("data-test-widget-list-row-id");
            list.add(Long.parseLong(Objects.requireNonNull(attribute)));
        }
        return list;
    }

    /**
     * Getting the number of lines from the current page
     *
     * @return Integer
     */
    @Step("Getting the number of lines from the current page")
    public Integer getSizeList() {
        waitingForTests.getWaitAllElements(widget);
        return helper.getListRows().size();
    }

    /**
     * Getting a list of lines from all pages
     *
     * @return List String
     */
    @Step("Getting a list of lines from all pages")
    public List<String> getListRowsTexts() {
        List<String> rowTexts = new ArrayList<>();
        waitingForTests.getWaitAllElements(widget);
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
            waitingForTests.getWaitAllElements(widget);
        }
        return rowTexts;
    }

    /**
     * Getting the column/column index
     *
     * @param columnName Name
     * @return int
     */
    @Step("Getting the column/column index {columnName}")
    public int getColumnIndex(String columnName) {
        Allure.addAttachment("ColumnName", columnName);
        ElementsCollection columns = this.widget.$$(By.xpath("div//div[contains(@class,'ColumnTitle')]"))
                .shouldBe(CollectionCondition.sizeNotEqual(0));
        int columnIndex = -1;
        for (int i = 0; i < columns.size(); i++) {
            if (columnName.equals(columns.get(i).getText())) {
                columnIndex = i;
                break;
            }
        }
        return columnIndex;
    }

    private Long findRowId(String columnName, String columnValue) {
        return helper.getListRows()
                .shouldHave(CollectionCondition.sizeGreaterThan(0))
                .stream()
                .filter(r -> helper.getColumnByName(columnName, r).getText().equals(columnValue))
                .findFirst()
                .map(r -> r.attr("data-test-widget-list-row-id"))
                .map(Long::valueOf)
                .orElseThrow(() -> new IllegalArgumentException(format("no row with columnValue=%s found", columnValue)));
    }

    /**
     * Cell search by column name and the meaning in it.
     *
     * @param columnName  Column's name
     * @param columnValue Значение в ячейке
     * @return ListWidget a class with access to fields
     */
    @Step("Cell search by column name {columnName} and the meaning in it {columnValue}")
    public ListWidget findRowSegmentByValue(String columnName, String columnValue) {
        Allure.addAttachment("ColumnName", columnName);
        Allure.addAttachment("columnValue", columnValue);
        waitingForTests.getWaitAllElements(widget);
        long id = findRowId(columnName, columnValue);
        return new ListWidget(columnName, widget, String.valueOf(id), this.helper, checkSorting(columnName), checkFilterColumn(columnName));
    }

    /**
     * Cell search by column name and a Unique row number
     *
     * @param columnName Column's name
     * @param id         Unique row number
     * @return ListWidget a class with access to fields
     */
    @Step("Cell search by column name {columnName} and a Unique row number {id}")
    public ListWidget findRowSegmentById(String columnName, long id) {
        Allure.addAttachment("ColumnName", columnName);
        Allure.addAttachment("Id", String.valueOf(id));
        waitingForTests.getWaitAllElements(widget);
        return new ListWidget(columnName, widget, String.valueOf(id), this.helper, checkSorting(columnName), checkFilterColumn(columnName));
    }

    /**
     * Getting the value without focusing on the field.
     * To get the exact value, you should use the following methods:
     * findRowSegmentByValue or findRowSegmentById  with field type selection
     *
     * @param columnName Column's name
     * @return List String
     */
    @Step("Getting the values of the {columnName} column without field focus")
    public List<String> getNoFocusValues(String columnName) {
        Allure.addAttachment("ColumnName", columnName);
        List<String> list = new ArrayList<>();
        while (true) {
            waitingForTests.getWaitAllElements(widget);
            helper.getListRows()
                    .shouldBe(CollectionCondition.sizeGreaterThan(0))
                    .forEach(row -> {
                        try {
                            String ColumnText = helper.getColumnByName(columnName, row).getText();
                            list.add(ColumnText);
                            log.info("Adding the result to the list: {}", ColumnText);
                        } catch (StaleElementReferenceException ex) {
                            waitingForTests.getWaitAllElements(row);
                            String ColumnText = helper.getColumnByName(columnName, row).getText();
                            list.add(ColumnText);
                            log.info("Adding a result to the list via exceptions");
                        }
                    });
            if (helper.isLastPage()) {
                break;
            }
            helper.pressRight(1);
            waitingForTests.getWaitAllElements(widget);
        }
        return list;
    }

    /**
     * Getting a status without focusing on the field.
     *
     * @param columnName Column's name
     * @return List Boolean true/false
     */
    @Step("Getting the status of the {columnName} column without field focus")
    public List<Boolean> getNoFocusStatusValues(String columnName) {
        Allure.addAttachment("ColumnName", columnName);
        List<Boolean> list = new ArrayList<>();
        while (true) {
            waitingForTests.getWaitAllElements(widget);
            helper.getListRows()
                    .shouldBe(CollectionCondition.sizeGreaterThan(0))
                    .forEach(row -> {
                        try {
                            list.add(helper.getColumnByName(columnName, row).$(By.tagName("input")).isSelected());
                        } catch (StaleElementReferenceException ex) {
                            list.add(helper.getColumnByName(columnName, row).$(By.tagName("input")).isSelected());
                        }
                    });
            if (helper.isLastPage()) {
                break;
            }
            helper.pressRight(1);
        }
        return list;
    }

    private SelenideElement getColumn(String columnName) {
        for (SelenideElement c : helper.getColumns()) {

            if (Objects.equals(c.getAttribute("data-test-widget-list-header-column-title"), columnName)) {
                return c;
            }
        }
        throw new RuntimeException("Column  " + columnName + " not found");
    }

    /**
     * Getting the column type
     *
     * @param column Column's name
     * @return String
     */
    @Step("Getting the column type {column}")
    public String getTypeColumn(String column) {
        Allure.addAttachment("ColumnName", column);
        return getColumn(column).getAttribute("data-test-widget-list-header-column-type");
    }

    /**
     * Checking the filtering option for a column
     *
     * @param column Column's name
     * @return Boolean true/false
     */
    @Step("Checking the filtering option for a column {column}")
    public Boolean checkFilterColumn(String column) {
        Allure.addAttachment("ColumnName", column);
        if (getColumn(column)
                .$("div[data-test-widget-list-header-column-filter=\"true\"]")
                .is(Condition.exist)) {
            return getColumn(column)
                    .$("div[data-test-widget-list-header-column-filter=\"true\"]")
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .is(Condition.visible);
        } else {
            log.info("Filter not found");
            return false;
        }
    }

    /**
     * Checking the sorting of a column
     *
     * @param column Column's name
     * @return Boolean true/false
     */
    @Step("Checking the sorting option for a column {column}")
    public Boolean checkSorting(String column) {
        Allure.addAttachment("ColumnName", column);
        Selenide.sleep(200);
        if (getColumn(column)
                .$("div[data-test-widget-list-header-column-sort=\"true\"] i.anticon-caret-up").is(Condition.exist)) {
            return getColumn(column)
                    .$("div[data-test-widget-list-header-column-sort=\"true\"] i.anticon-caret-up")
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .hover()
                    .is(Condition.visible);
        } else {
            log.info("Sorting not found");
            return false;
        }

    }


    /**
     * Sorting. If the column has a sorting function.
     *
     * @param column Column's name
     */
    @Step("Sorting in a column {column}")
    public void setSorting(String column) {
        helper.returnFirstPage();
        if (checkSorting(column)) {
            helper.setSorting(column);
            waitingForTests.getWaitAllElements(widget);
        } else {
            log.error("Ошибка при установке сортировки для столбца {}", column);
            throw new RuntimeException("The sorting for the column " + column + " was not found. Or unavailable.");
        }
    }

    /**
     * Filtering search for the selected column
     *
     * @param column Column's name
     * @return Filter Sheet
     */
    @Step("Checking the filtering of the {column} column and returning the class with Filters")
    public ListFilter findFilterColumn(String column) {
        Allure.addAttachment("ColumnName", column);
        if (checkFilterColumn(column)) {
            getColumn(column)
                    .$("div[data-test-widget-list-header-column-filter=\"true\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
            return new ListFilter(getTypeColumn(column), column, helper, widget);
        } else {
            throw new RuntimeException("The filter for the column " + column + " was not found.");
        }

    }

    /**
     * A filter with options.
     *
     * @return DropdownFilter
     */
    @Step("Call a DropdownFilter")
    public DropdownFilter findDropdownFilter() {
        return new DropdownFilter(widget);
    }

    /**
     * A text filter.
     *
     * @return FullTextFilter
     */
    @Step("Call a FullTextFilter")
    public FullTextFilter findFullTextFilter() {
        return new FullTextFilter(widget);
    }

    /**
     * Cleaning filters
     */
    @Step("Cleaning filters")
    public void clearFilter() {
        widget
                .$("a[class*=ActionLink]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        waitingForTests.getWaitAllElements(widget);
    }

    /**
     * Selecting an option from the Filtering Header. The filtering header is located above the table
     *
     * @param actionName Button's name
     */
    @Step("Selecting the {actionName} option from the Filtering Header")
    public void setActionFiltersContainer(String actionName) {
        waitingForTests.getWaitAllElements(widget);
        for (SelenideElement action : getActionsFiltersContainer()) {
            waitingForTests.getWaitAllElements(action);
            if (action.getText().equals(actionName)) {
                action.click();
                waitingForTests.getWaitAllElements(widget);
            }
        }
    }

    private ElementsCollection getActionsFiltersContainer() {
        return widget
                .$$("a[class*=ActionLink]");
    }

    /**
     * Validating the gear menu and gaining access to the class
     *
     * @return GearMenu
     */
    @Step("Opening the gear menu")
    public Optional<GearMenu> findGearMenu() {
        SelenideElement gear = widget
                .$("button[class*=\"ant-btn Button__root___FpVWX ant-dropdown-trigger\"]")
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout));
        if (gear.is(Condition.enabled)) {
            gear.click();
            return Optional.of(new GearMenu());
        } else {
            return Optional.empty();
        }
    }

    private void processElements(SelenideElement element, Cell cell) {
        List<CellProcessor> processors = List.of(
                new CheckBoxCell(),
                new DateCell(),
                new DateTimeCell(),
                new DateTimeWithSecondsCell(),
                new DictionaryCell(),
                new FileUploadCell(),
                new HintCell(),
                new InputCell(),
                new MoneyCell(),
                new MultiFieldCell(),
                new MultipleSelectCell(),
                new MultiValueCell(),
                new MultiValueHoverCell(),
                new NumberCell(),
                new PercentCell(),
                new InlinePickListCell(),
                new PickListCell(),
                new RadioCell(),
                new TextCell()
        );

        CellManager manager = new CellManager(processors);

        manager.processElement(element, cell);
    }

    /**
     * Parsing a spreadsheet in Excel
     *
     * @return File .xlsx
     */
    @Step("Parsing a spreadsheet in Excel")
    public File parseTableListWidget() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Мой лист");

            Row headerRow = sheet.createRow(0);

            List<String> headers = getColumnNames();
            for (int i = 0; i < headers.size(); i++) {
                Cell headerCell = headerRow.createCell(i);
                headerCell.setCellValue(headers.get(i));
            }
            int rowNum = 1;
            while (true) {
                for (SelenideElement row : getListRowsCollection()) {
                    Row rowSheet = sheet.createRow(rowNum++);
                    for (int i = 0; i < headers.size(); i++) {
                        Cell cell = rowSheet.createCell(i);
                        try {
                            SelenideElement element = row.$$("td").get(i).$("div");
                            log.info("Number element in process: {}", i + 1);
                            processElements(element, cell);
                            CellStyle style = workbook.createCellStyle();
                            if (getColor(element) != null) {
                                XSSFColor myColor = new XSSFColor(getColor(element));
                                style.setFillForegroundColor(myColor);
                                style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                                cell.setCellStyle(style);
                            }
                        } catch (StaleElementReferenceException e) {
                            log.error("Error: The link to the element is outdated.");
                        }

                    }
                }
                if (helper.isLastPage()) {
                    break;
                }
                helper.pressRight(1);
                waitingForTests.getWaitAllElements(widget);
            }

            File directory = new File("target");
            File file = File.createTempFile("HeavenAndHell" + LocalDate.now(), ".xlsx", directory);
            try (FileOutputStream fileOut = new FileOutputStream(file)) {
                workbook.write(fileOut);
                log.info("The file was created successfully. {}", file);
                return file;
            } catch (IOException ex) {
                log.error("The file has not been created: {}", ex);
            }

        } catch (IOException e) {
            log.error("Error when creating a book: {}", e);
        }
        return null;
    }

    private ElementsCollection getListRowsCollection() {
        try {
            return helper.getListRows();
        } catch (StaleElementReferenceException e) {
            return helper.getListRows();
        }
    }

    private byte[] getColor(SelenideElement element) {
        if (element.$("div[style]").is(Condition.exist)) {
            String styleAttribute = element.$("div[style]").getAttribute("style");
            if (styleAttribute != null) {
                Pattern pattern = Pattern.compile("rgb\\((\\d{1,3}, \\d{1,3}, \\d{1,3})\\)");
                Matcher matcher = pattern.matcher(styleAttribute);
                if (matcher.find()) {
                    String rgb = matcher.group(1);
                    String[] strings = rgb.split(", ");

                    int r = Integer.parseInt(strings[0]);
                    int g = Integer.parseInt(strings[1]);
                    int b = Integer.parseInt(strings[2]);

                    byte[] rgb2 = new byte[3];
                    rgb2[0] = (byte) r;
                    rgb2[1] = (byte) g;
                    rgb2[2] = (byte) b;

                    return rgb2;
                }
            }
        }
        return null;
    }

    /**
     * Bulk file upload..
     *
     * @return class AddFiles
     */
    @Step("Validation of the mass upload field")
    public Optional<AddFiles> findAddFiles() {
        if (widget
                .$("div[class=\"ant-upload ant-upload-select ant-upload-select-text\"]")
                .$("button[data-test-widget-action-item=\"true\"]")
                .scrollIntoView("{block: \"center\"}")
                .is(Condition.visible)) {
            return Optional.of(new AddFiles(widget));
        } else {
            return Optional.empty();
        }
    }

    /**
     * Clicking on the button by its name
     *
     * @param actionName Name button
     */
    @Step("Clicking on the button {actionName}")
    public void clickButton(String actionName) {
        SelenideElement button = getButton(actionName);
        button
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
    }

    /**
     * Clicking on the button by its name. With subsequent waiting
     *
     * @param actionName Button's name
     * @param consumer   Waiting to be performed after clicking (Waiting for widget, fields, rows)
     */
    @Step("Clicking on the button {actionName} with post-waiting")
    public void clickButton(String actionName, Consumer<ExpectationPattern> consumer) {
        SelenideElement button = getButton(actionName);
        button
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        consumer.accept(ExpectationsFactoryProvider.getTestFactory());
    }

    /**
     * Displaying a list of all buttons in a widget
     */
    @Step("Getting a list of buttons")
    public List<String> getButtons() {
        return getContainersActions().texts();
    }

    private SelenideElement getButton(String actionName) {
        return getContainersActions()
                .find(Condition.match("check action name: " + actionName, b -> b.getText().equals(actionName)));
    }

    private ElementsCollection getContainersActions() {
        return getContainer()
                .$$(By.tagName("button"))
                .shouldHave(CollectionCondition.sizeGreaterThan(0));
    }

    private SelenideElement getContainer() {
        return widget
                .scrollIntoView("{block: \"center\"}")
                .shouldBe(Condition.enabled);
    }

    /**
     * Comparing two files in the format .xlsx
     *
     * @param given    first file
     * @param expected second file
     * @return List(String) List of differences
     */
    @Step("Comparing two files in the format .xlsx . The first file is {given}. Second file: {expected}.")
    @SneakyThrows
    public List<String> FileExcelComparator(File given, File expected) {
        Allure.addAttachment("FileName given", given.getName());
        Allure.addAttachment("FileName expected", expected.getName());
        Workbook wb1 = WorkbookFactory.create(new File(given.getPath()));
        Workbook wb2 = WorkbookFactory.create(new File(expected.getPath()));
        return ExcelComparator.compare(wb1, wb2);
    }

    /**
     * Validating the pagination menu and gaining access to the class
     *
     * @return Pagination
     */
    @Step("Validating the pagination menu and gaining access to the class")
    public Optional<Pagination> findPaginationMenu() {
        if (widget.$("div[data-test-widget-list-pagination=\"true\"]")
                .scrollIntoView("{block: \"center\"}")
                .is(Condition.visible)) {
            return Optional.of(new Pagination(widget));
        } else {
            return Optional.empty();
        }
    }

    /**
     * Search for a row by id on the current page
     *
     * @param id you can get it using the method getRowIdFromUrl
     * @return Boolean true/false
     */
    @Step("Search for a row by id on the current page")
    public Boolean checkRowById(@NonNull Long id) {
        Allure.addAttachment("Id", id.toString());
        ElementsCollection rows = helper.getListRows();
        return rows.stream()
                .anyMatch(row -> id.equals(Long.parseLong(Objects.requireNonNull(row.shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout)).getAttribute("data-test-widget-list-row-id")))));
    }

    /**
     * Opening an InlineForm to create a new line
     *
     * @return FormWidget with access to all fields
     */
    @Step("Opening an InlineForm to create a new line")
    public Optional<FormWidget> openAndFindInlineForm() {
        String inlineForm = "div[data-test-widget-list-row-type=\"InlineForm\"]";
        clickButton("Add");
        waitingForTests.getWaitAllElements(widget);
        if ($(inlineForm)
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .is(Condition.visible)) {
            return Optional.of(new FormWidget(title, $(inlineForm)));
        } else {
            return Optional.empty();
        }
    }

    /**
     * Getting a list of fields in a heading and type pair
     *
     * @return HashMap(String, String)
     */
    @Step("Getting a list of fields in a heading and type pair")
    public HashMap<String, String> getFieldTitleAndType() {
        HashMap<String, String> values = new HashMap<>();
        for (SelenideElement field : widget.shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout)).$$("div[data-test]")) {
            String title = field.attr("data-test-field-title");
            String type = field.attr("data-test-field-type");
            values.put(title, type);
        }
        return values;
    }
}
