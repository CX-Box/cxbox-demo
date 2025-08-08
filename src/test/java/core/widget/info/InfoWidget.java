package core.widget.info;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.info.field.checkbox.CheckBox;
import core.widget.info.field.date.Date;
import core.widget.info.field.datetime.DateTime;
import core.widget.info.field.datetimewithseconds.DateTimeWithSeconds;
import core.widget.info.field.dictionary.Dictionary;
import core.widget.info.field.fileupload.FileUpload;
import core.widget.info.field.hidden.Hidden;
import core.widget.info.field.hint.Hint;
import core.widget.info.field.input.Input;
import core.widget.info.field.money.Money;
import core.widget.info.field.multifield.MultiField;
import core.widget.info.field.multipleselect.MultipleSelect;
import core.widget.info.field.multivalue.MultiValue;
import core.widget.info.field.multivaluehover.MultiValueHover;
import core.widget.info.field.number.Number;
import core.widget.info.field.number.NumberDigits;
import core.widget.info.field.percent.Percent;
import core.widget.info.field.percent.PercentDigits;
import core.widget.info.field.picklist.InlinePickList;
import core.widget.info.field.picklist.PickListField;
import core.widget.info.field.radio.Radio;
import core.widget.info.field.text.Text;
import core.widget.info.field.time.Time;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.HashMap;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class InfoWidget {

    protected final String title;

    protected final SelenideElement widget;

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    /**
     * Getting access to field functions Input.
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class Input
     */
    public Input input(String title) {
        return Allure.step("Validation of a field with the Input by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new Input(this, title);
        });
    }

    /**
     * Getting access to field functions Money
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class Money
     */
    public Money money(String title) {
        return Allure.step("Validation of a field with the Money by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new Money(this, title);
        });
    }

    /**
     * Getting access to field functions Date
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class Date
     */
    public Date date(String title) {
        return Allure.step("Validation of a field with the Date by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new Date(this, title);
        });
    }

    public Time time(String title, String format) {
        return Allure.step("Validation of a field with the Date by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new Time(this, title, format);
        });
    }

    /**
     * Getting access to field functions DateTime
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class DateTime
     */
    public DateTime dateTime(String title) {
        return Allure.step("Validation of a field with the DateTime by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new DateTime(this, title);
        });
    }

    /**
     * Getting access to field functions DateTimeWithSeconds
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class DateTimeWithSeconds
     */
    public DateTimeWithSeconds dateTimeWithSeconds(String title) {
        return Allure.step("Validation of a field with the DateTimeWithSeconds by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new DateTimeWithSeconds(this, title);
        });
    }

    /**
     * Getting access to field functions Number
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class Number
     */
    public Number number(String title) {
        return Allure.step("Validation of a field with the Number by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new Number(this, title);
        });
    }

    /**
     * Getting access to field functions NumberDigits
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class NumberDigits
     */
    public NumberDigits numberDigits(String title) {
        return Allure.step("Validation of a field with the NumberDigits by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new NumberDigits(this, title);
        });
    }

    /**
     * Getting access to field functions Percent
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class Percent
     */
    public Percent percent(String title) {
        return Allure.step("Validation of a field with the Percent by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new Percent(this, title);
        });
    }

    /**
     * Getting access to field functions Percent
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class Percent
     */
    public PercentDigits percentDigits(String title) {
        return Allure.step("Validation of a field with the Percent by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new PercentDigits(this, title);
        });
    }

    /**
     * Getting access to field functions Text
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Widget title
     * @return Селектор infoWidget
     */
    public Text text(String title) {
        return Allure.step("Validation of a field with the Text by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new Text(this, title);
        });
    }

    /**
     * Getting access to field functions Radio
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class Radio
     */
    public Radio radio(String title) {
        return Allure.step("Validation of a field with the Radio by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new Radio(this, title);
        });
    }

    /**
     * Getting access to field functions CheckBox
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class CheckBox
     */
    public CheckBox checkBox(String title) {
        return Allure.step("Validation of a field with the CheckBox by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new CheckBox(this, title);
        });
    }

    /**
     * Getting access to field functions Dictionary
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class Dictionary
     */
    public Dictionary dictionary(String title) {
        return Allure.step("Validation of a field with the Dictionary by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new Dictionary(this, title);
        });
    }

    /**
     * Getting access to field functions MultipleSelect
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class MultipleSelect
     */
    public MultipleSelect multipleSelect(String title) {
        return Allure.step("Validation of a field with the MultipleSelect by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new MultipleSelect(this, title);
        });
    }

    /**
     * Getting access to field functions FileUpload
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class FileUpload
     */
    public FileUpload fileUpload(String title) {
        return Allure.step("Validation of a field with the FileUpload by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new FileUpload(this, title);
        });
    }

    /**
     * Getting access to field functions MultiValue
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class MultiValue
     */
    public MultiValue multiValue(String title) {
        return Allure.step("Validation of a field with the MultiValue by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new MultiValue(this, title);
        });
    }

    /**
     * Getting access to field functions Hidden
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class Hidden
     */
    public Hidden hidden(String title) {
        return Allure.step("Validation of a field with the Hidden by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new Hidden(this, title);
        });
    }

    /**
     * Getting access to field functions Hint
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class Hint
     */
    public Hint hint(String title) {
        return Allure.step("Validation of a field with the Hint by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new Hint(this, title);
        });
    }

    /**
     * Getting access to field functions MultiValueHover
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class MultiValueHover
     */
    public MultiValueHover multiValueHover(String title) {
        return Allure.step("Validation of a field with the MultiValueHover by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new MultiValueHover(this, title);
        });
    }

    /**
     * Getting access to field functions MultiField
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class MultiField
     */
    public MultiField multiField(String title) {
        return Allure.step("Validation of a field with the MultiField by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new MultiField(this, title);
        });
    }

    /**
     * Getting access to field functions InlinePickList
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class InlinePickList
     */
    public InlinePickList inlinePickList(String title) {
        return Allure.step("Validation of a field with the InlinePickList by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new InlinePickList(this, title);
        });
    }

    /**
     * Getting access to field functions PickList
     * For InfoWidget Setting the not available. ReadOnly.
     *
     * @param title Field header
     * @return class PickList
     */
    public PickListField pickListField(String title) {
        return Allure.step("Validation of a field with the PickList by heading " + title, step -> {
            logTime(step);
            step.parameter("Field header", title);

            return new PickListField(this, title);
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
