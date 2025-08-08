package core.widget.list;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$x;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.ListHelper;
import core.widget.form.FormWidget;
import core.widget.list.actions.MenuRow;
import core.widget.list.field.checkbox.Checkbox;
import core.widget.list.field.date.Date;
import core.widget.list.field.date.DateTime;
import core.widget.list.field.date.DateTimeWithSeconds;
import core.widget.list.field.dictionary.Dictionary;
import core.widget.list.field.fileupload.FileUpload;
import core.widget.list.field.hidden.Hidden;
import core.widget.list.field.hint.Hint;
import core.widget.list.field.input.Input;
import core.widget.list.field.money.Money;
import core.widget.list.field.multifield.MultiField;
import core.widget.list.field.multipleselect.MultipleSelect;
import core.widget.list.field.multivalue.MultiValue;
import core.widget.list.field.multivaluehover.MultiValueHover;
import core.widget.list.field.number.Number;
import core.widget.list.field.number.NumberDigits;
import core.widget.list.field.percent.Percent;
import core.widget.list.field.percent.PercentDigits;
import core.widget.list.field.picklist.InlinePickList;
import core.widget.list.field.picklist.PickList;
import core.widget.list.field.picklist.SuggestionPickList;
import core.widget.list.field.radio.Radio;
import core.widget.list.field.text.Text;
import core.widget.list.field.time.Time;
import io.qameta.allure.Step;
import java.time.Duration;
import java.util.Optional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class ListWidget {

    protected final String title;

    protected final SelenideElement widget;

    protected final String id;

    protected final ListHelper listHelper;

    protected final Boolean filter;

    protected final Boolean sort;

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();


    /**
     * Getting access to field functions Input
     * The field accepts all text(String) values, depending on the input rules.
     *
     * @return class Input
     */
    @Step("Validation of a field with the Input by heading ")
    public Input input() {
        return new Input(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Money
     * The field accepts numeric values in BigDecimal format.
     *
     * @return class Money
     */
    @Step("Validation of a field with the Money by heading ")
    public Money money() {
        return new Money(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Date
     * The field accepts values in the LocalDate format.
     *
     * @return class Date
     */
    @Step("Validation of a field with the Date by heading ")
    public Date date() {
        return new Date(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Time
     * The field accepts values in the LocalDateTime format.
     *
     * @return class Time
     */
    @Step("Validation of a field with the Time by heading ")
    public Time time(String format) {
        return new Time(this, title, id, listHelper, sort, filter, format);
    }

    /**
     * Getting access to field functions DateTime
     * The field accepts values in the LocalDateTime format.
     *
     * @return class DateTime
     */
    @Step("Validation of a field with the DateTime by heading ")
    public DateTime dateTime() {
        return new DateTime(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions DateTimeWithSeconds
     * The field accepts values in the LocalDateTime format.
     *
     * @return class DateTimeWithSeconds
     */
    @Step("Validation of a field with the DateTimeWithSeconds by heading ")
    public DateTimeWithSeconds dateTimeWithSeconds() {
        return new DateTimeWithSeconds(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Number
     * The field accepts values in Integer format, only integers.
     *
     * @return class Number
     */
    @Step("Validation of a field with the Number by heading ")
    public Number number() {
        return new Number(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions NumberDigits
     * The field accepts values in BigDecimal format, the ability to enter numbers with a fractional part.
     *
     * @return class NumberDigits
     */
    @Step("Validation of a field with the NumberDigits by heading ")
    public NumberDigits numberDigits() {
        return new NumberDigits(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Percent
     * The field accepts values in Integer format, only integers.
     *
     * @return class Percent
     */
    @Step("Validation of a field with the Percent by heading ")
    public Percent percent() {
        return new Percent(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Percent
     * The field accepts values in Integer format, only integers.
     *
     * @return class Percent
     */
    @Step("Validation of a field with the PercentDigits by heading ")
    public PercentDigits percentDigits() {
        return new PercentDigits(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Dictionary
     * The field accepts values in String format
     *
     * @return class Dictionary
     */
    @Step("Validation of a field with the Dictionary by heading ")
    public Dictionary dictionary() {
        return new Dictionary(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions FileUpload
     * The field accepts values in the File format
     *
     * @return class FileUpload
     */
    @Step("Validation of a field with the FileUpload by heading ")
    public FileUpload fileUpload() {
        return new FileUpload(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Hint
     * The field accepts values in the List(String) format to select multiple values.
     *
     * @return class Hint
     */
    @Step("Validation of a field with the Hint by heading ")
    public Hint hint() {
        return new Hint(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Hidden
     * The field accepts values in the List(String) format to select multiple values.
     *
     * @return class Hidden
     */
    @Step("Validation of a field with the Hidden by heading ")
    public Hidden hidden() {
        return new Hidden(this, title, id);
    }

    /**
     * Getting access to field functions MultiField
     *
     * @return class MultiField
     */
    @Step("Validation of a field with the MultiField by heading ")
    public MultiField multiField() {
        return new MultiField(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions MultipleSelect
     * The field accepts values in the Set(String) format to select multiple values.
     *
     * @return class MultipleSelect
     */
    @Step("Validation of a field with the MultipleSelect by heading ")
    public MultipleSelect multipleSelect() {
        return new MultipleSelect(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions MultiValue
     * The field accepts values in the List(String) format to select multiple values.
     *
     * @return class MultiValue
     */
    @Step("Validation of a field with the MultiValue by heading ")
    public MultiValue multiValue() {
        return new MultiValue(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions MultiValueHover
     * The field does not accept values, ReadOnly
     *
     * @return class MultiValueHover
     */
    @Step("Validation of a field with the MultiValueHover by heading ")
    public MultiValueHover multiValueHover() {
        return new MultiValueHover(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions PickList
     * The field accepts values via Popup, which is opened separately.
     *
     * @return class PickList
     */
    @Step("Validation of a field with the PickList by heading ")
    public PickList pickListField() {
        return new PickList(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions InlinePickList
     * The field accepts values via a drop-down list, in String format
     *
     * @return class InlinePickList
     */
    @Step("Validation of a field with the InlinePickList by heading ")
    public InlinePickList inlinePickList() {
        return new InlinePickList(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions InlinePickList
     * The field accepts values via a drop-down list, in String format
     *
     * @return class InlinePickList
     */
    @Step("Validation of a field with the InlinePickList by heading ")
    public SuggestionPickList suggestionPickList() {
        return new SuggestionPickList(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Text
     * The field accepts values in String format
     *
     * @return class Text
     */
    @Step("Validation of a field with the Text by heading ")
    public Text text() {
        return new Text(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Checkbox
     * The field accepts values in the Boolean format.
     *
     * @return class Checkbox
     */
    @Step("Validation of a field with the CheckBox by heading ")
    public Checkbox checkbox() {
        return new Checkbox(this, title, id, listHelper, sort, filter);
    }

    /**
     * Getting access to field functions Radio
     * The field accepts values in String format, to set them to the true/false state
     *
     * @return class Radio
     */
    @Step("Validation of a field with the Radio by heading ")
    public Radio radio() {
        return new Radio(this, title, id, listHelper, sort, filter);
    }

    /**
     * Validation and opening of the line menu (three dots)
     *
     * @return class MenuRow
     */
    @Step("Search and access the line menu(three dots)")
    public Optional<MenuRow> findMenuRow() {
        SelenideElement row = $("tr[data-test-widget-list-row-id=\"" + id + "\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
        row
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .hover();
        $x("//body")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .hover();
        row
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .hover();
        $("button[data-test-widget-list-row-action=\"true\"]")
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .hover()
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        if ($("ul[class=\"ant-dropdown-menu ant-dropdown-menu-light ant-dropdown-menu-root ant-dropdown-menu-vertical\"]")
                .is(Condition.enabled)) {
            return Optional.of(new MenuRow());
        } else {
            return Optional.empty();
        }
    }

    /**
     * Opening the timeline editor via InlineForm
     *
     * @return class FormWidget with access to all fields
     */
    @Step("Validation и Opening the InlineForm for editing строки")
    public Optional<FormWidget> openInlineFormRowForEdit() {
        String inlineForm = "div[data-test-widget-list-row-id=\"" + id + "\"][data-test-widget-list-row-type=\"InlineForm\"]";
        SelenideElement iconEdit = $("tr[data-test-widget-list-row-id=\"" + id + "\"][data-test-widget-list-row-type=\"Row\"]")
                .$("i[aria-label=\"icon: edit\"]")
                .scrollIntoView("{block: \"center\"}")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
        iconEdit.click();
        if ($(inlineForm)
                .is(Condition.visible)) {
            return Optional.of(new FormWidget(title, $(inlineForm)));
        } else {
            return Optional.empty();
        }
    }


}
