package core.widget.form;

import static com.codeborne.selenide.Selectors.by;
import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.*;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.addfiles.AddFiles;
import core.widget.form.actions.ButtonWithMenu;
import core.widget.form.field.checkbox.CheckBox;
import core.widget.form.field.date.Date;
import core.widget.form.field.datetime.DateTime;
import core.widget.form.field.datetimewithseconds.DateTimeWithSeconds;
import core.widget.form.field.dictionary.Dictionary;
import core.widget.form.field.fileupload.FileUpload;
import core.widget.form.field.hidden.Hidden;
import core.widget.form.field.hint.Hint;
import core.widget.form.field.input.Input;
import core.widget.form.field.money.Money;
import core.widget.form.field.multifield.MultiField;
import core.widget.form.field.multipleselect.MultipleSelect;
import core.widget.form.field.multivalue.MultiValue;
import core.widget.form.field.multivaluehover.MultiValueHover;
import core.widget.form.field.number.Number;
import core.widget.form.field.number.NumberDigits;
import core.widget.form.field.percent.Percent;
import core.widget.form.field.percent.PercentDigits;
import core.widget.form.field.picklist.InlinePickList;
import core.widget.form.field.picklist.PickList;
import core.widget.form.field.picklist.SuggestionPickList;
import core.widget.form.field.radio.Radio;
import core.widget.form.field.text.Text;
import core.widget.form.field.time.Time;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;


@RequiredArgsConstructor
@Getter
@Slf4j
public class FormWidget {

    protected final String title;

    protected final SelenideElement widget;

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();


    /**
     * Getting access to field functions Input.
     * The field accepts all text(String) values, depending on the input rules.
     *
     * @param title Field header
     * @return class Input
     */
    public Input input(String title) {
        return Allure.step("Validation of a field with the Input by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new Input(this, title);
        });
    }

    /**
     * Getting access to field functions Money
     * The field accepts numeric values in BigDecimal format.
     *
     * @param title Field header
     * @return class Money
     */
    public Money money(String title) {
        return Allure.step("Validation of a field with the Money by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new Money(this, title);
        });

    }

    /**
     * Getting access to field functions Date
     * The field accepts values in the LocalDate format.
     *
     * @param title Field header
     * @return class Date
     */
    @Step("Validation of a field with the Date by heading  {title}")
    public Date date(String title) {
        return Allure.step("Validation of a field with the Date by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new Date(this, title);
        });
    }

    /**
     * Getting access to field functions DateTime
     * The field accepts values in the LocalDateTime format.
     *
     * @param title Field header
     * @return class DateTime
     */
    public DateTime dateTime(String title) {
        return Allure.step("Validation of a field with the DateTime by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new DateTime(this, title);
        });
    }

    /**
     * Getting access to field functions DateTimeWithSeconds
     * The field accepts values in the LocalDateTime format.
     *
     * @param title Field header
     * @return class DateTimeWithSeconds
     */
    public DateTimeWithSeconds dateTimeWithSeconds(String title) {
        return Allure.step("Validation of a field with the DateTimeWithSeconds by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new DateTimeWithSeconds(this, title);
        });
    }

    /**
     * Getting access to field functions DateTimeWithSeconds
     * The field accepts values in the LocalDateTime format.
     *
     * @param title Field header
     * @return class DateTimeWithSeconds
     */
    public Time time(String title, String format) {
        return Allure.step("Validation of a field with the DateTimeWithSeconds by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new Time(this, title, format);
        });
    }

    /**
     * Getting access to field functions Number
     * The field accepts values in Integer format, only integers.
     *
     * @param title Field header
     * @return class Number
     */
    public Number number(String title) {
        return Allure.step("Validation of a field with the Number by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new Number(this, title);
        });
    }

    /**
     * Getting access to field functions NumberDigits
     * The field accepts values in BigDecimal format, the ability to enter numbers with a fractional part.
     *
     * @param title Field header
     * @return class NumberDigits
     */
    public NumberDigits numberDigits(String title) {
        return Allure.step("Validation of a field with the NumberDigits by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new NumberDigits(this, title);
        });
    }

    /**
     * Getting access to field functions Percent
     * The field accepts values in Integer format, only integers.
     *
     * @param title Field header
     * @return class Percent
     */
    public Percent percent(String title) {
        return Allure.step("Validation of a field with the Percent by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new Percent(this, title);
        });
    }

    /**
     * Getting access to field functions PercentDigits
     * The field accepts values in BigDecimal format, the ability to enter numbers with a fractional part.
     *
     * @param title Field header
     * @return class PercentDigits
     */
    public PercentDigits percentDigits(String title) {
        return Allure.step("Validation of a field with the PercentDigits by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new PercentDigits(this, title);
        });
    }

    /**
     * Getting access to field functions Text
     * The field accepts values in String format
     *
     * @param title Field header
     * @return class Text
     */
    public Text text(String title) {
        return Allure.step("Validation of a field with the Text by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new Text(this, title);
        });
    }

    /**
     * Getting access to field functions Radio
     * The field accepts values in String format, to set them to the true/false state
     *
     * @param title Field header
     * @return class Radio
     */
    public Radio radio(String title) {
        return Allure.step("Validation of a field with the Radio by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new Radio(this, title);
        });
    }

    /**
     * Getting access to field functions CheckBox
     * The field accepts values in the Boolean format.
     *
     * @param title Field header
     * @return class CheckBox
     */
    public CheckBox checkBox(String title) {
        return Allure.step("Validation of a field with the CheckBox by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new CheckBox(this, title);
        });
    }

    /**
     * Getting access to field functions Dictionary
     * The field accepts values in String format
     *
     * @param title Field header
     * @return class Dictionary
     */
    public Dictionary dictionary(String title) {
        return Allure.step("Validation of a field with the Dictionary by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new Dictionary(this, title);
        });

    }

    /**
     * Getting access to field functions MultipleSelect
     * The field accepts values in the Set(String) format to select multiple values.
     *
     * @param title Field header
     * @return class MultipleSelect
     */
    public MultipleSelect multipleSelect(String title) {
        return Allure.step("Validation of a field with the MultipleSelect by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new MultipleSelect(this, title);
        });

    }

    /**
     * Getting access to field functions FileUpload
     * The field accepts values in the File format
     *
     * @param title Field header
     * @return class FileUpload
     */
    public FileUpload fileUpload(String title) {
        return Allure.step("Validation of a field with the FileUpload by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new FileUpload(this, title);
        });
    }

    /**
     * Getting access to field functions MultiValue
     * The field accepts values in the List(String) format to select multiple values.
     *
     * @param title Field header
     * @return class MultiValue
     */
    public MultiValue multiValue(String title) {
        return Allure.step("Validation of a field with the MultiValue by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new MultiValue(this, title);
        });
    }

    /**
     * Getting access to field functions Hint
     * The field does not accept values, ReadOnly
     *
     * @param title Field header
     * @return class Hint
     */
    public Hint hint(String title) {
        return Allure.step("Validation of a field with the Hint by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new Hint(this, title);
        });
    }

    public Hidden hidden(String title) {
        return Allure.step("Validation of a field with the Hidden by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new Hidden(this, title);
        });
    }

    /**
     * Getting access to field functions MultiValueHover
     * The field does not accept values, ReadOnly
     *
     * @param title Field header
     * @return class MultiValueHover
     */
    public MultiValueHover multiValueHover(String title) {
        return Allure.step("Validation of a field with the MultiValueHover by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new MultiValueHover(this, title);
        });
    }

    /**
     * Getting access to field functions MultiField
     * The field does not accept values, ReadOnly
     *
     * @param title Field header
     * @return class MultiField
     */
    public MultiField multiField(String title) {
        return Allure.step("Validation of a field with the MultiField by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new MultiField(this, title);
        });
    }

    /**
     * Getting access to field functions InlinePickList
     * The field accepts values via a drop-down list, in String format
     *
     * @param title Field header
     * @return class InlinePickList
     */
    public InlinePickList inlinePickList(String title) {
        return Allure.step("Validation of a field with the InlinePickList by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new InlinePickList(this, title);
        });
    }

    /**
     * Getting access to field functions PickList
     * The field accepts values via Popup, which is opened separately.
     *
     * @param title Field header
     * @return class PickList
     */
    public PickList pickList(String title) {
        return Allure.step("Validation of a field with the PickList by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new PickList(this, title);
        });

    }

    /**
     * Getting access to field functions SuggestionPickList
     * The field accepts values in String format. The associated fields are filled in automatically according to the field type.
     *
     * @param title Field header
     * @return class SuggestionPickList
     */
    public SuggestionPickList suggestionPickList(String title) {
        return Allure.step("Validation of a field with the SuggestionPickList by heading " + title, step -> {
            logTime(step);
            step.parameter("Field heading", title);

            return new SuggestionPickList(this, title);
        });
    }

    /**
     * Clicking on the button by its name
     *
     * @param actionName Name button on FormWidget
     */
    public void clickButton(String actionName) {
        Allure.step("Click on the button " + actionName, step -> {
            logTime(step);
            step.parameter("Action name", actionName);

            SelenideElement button = getButton(actionName);
            button
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });
    }

    /**
     * Displaying a list of all buttons in a widget
     */
    public List<String> getButtons() {
        return Allure.step("Getting a list of buttons", step -> {
            logTime(step);

            return getContainersActions().texts();
        });
    }

    private SelenideElement getButton(String actionName) {
        return getContainersActions()
                .find(Condition.match("check action name: " + actionName, b -> b.getText().equals(actionName)));
    }

    private ElementsCollection getContainersActions() {
        return getContainer()
                .findAll(by("type", "button"))
                .shouldHave(CollectionCondition.sizeGreaterThan(0));
    }

    private SelenideElement getContainer() {
        return widget
                .scrollIntoView("{block: \"center\"}")
                .shouldBe(Condition.enabled);
    }

    /**
     * Bulk file upload..
     *
     * @return class AddFiles
     */
    public Optional<AddFiles> findAddFiles() {
        return Allure.step("Validation of the Mass File upload field", step -> {
            logTime(step);

            if (widget.$("button[data-test-widget-action-item=\"true\"]").$(By.linkText("Add Files")).is(Condition.visible)) {
                return Optional.of(new AddFiles(widget));
            } else {
                return Optional.empty();
            }
        });
    }

    /**
     * Getting the row id when creating via Inline Form
     *
     * @return long
     */

    public long getIdInlineForm() {
        return Allure.step("Getting the row id when creating via Inline Form", step -> {
            logTime(step);

            if (widget.is(Condition.attribute("data-test-widget-list-row-type"))) {
                long l = Long.parseLong(Objects.requireNonNull(widget.getAttribute("data-test-widget-list-row-id")));
                log.info("Id new row is {}", l);
                return l;
            } else {
                throw new UnsupportedOperationException("It's not InlineForm");
            }
        });
    }

    /**
     * Pressing the button and opening the button menu
     *
     * @return class ButtonWithMenu
     */
    public Optional<ButtonWithMenu> openMenuButton() {
        return Allure.step("Pressing the button and opening the button menu", step -> {
            logTime(step);

            for (SelenideElement button : getContainersActions()) {
                if (Objects.requireNonNull(button.getAttribute("class")).matches("ant-dropdown-trigger")) {
                    button.click();
                    String cssSelector = "div[class=\"ant-dropdown ant-dropdown-placement-bottomLeft\"]";
                    if ($(cssSelector).is(Condition.visible)) {
                        return Optional.of(new ButtonWithMenu($(cssSelector)));
                    } else {
                        return Optional.empty();
                    }
                }
            }
            return Optional.empty();
        });
    }

    /**
     * Getting a list of fields in a heading and type pair
     *
     * @return HashMap(String, String)
     */

    public HashMap<String, String> getFieldTitleAndType() {
        return Allure.step("Getting a list of fields in a heading and type pair", step -> {
            logTime(step);

            HashMap<String, String> values = new HashMap<>();
            for (SelenideElement field : widget.shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout)).$$("div[data-test]")) {
                String title = field.attr("data-test-field-title");
                String type = field.attr("data-test-field-type");
                values.put(title, type);
            }
            return values;
        });
    }


}
