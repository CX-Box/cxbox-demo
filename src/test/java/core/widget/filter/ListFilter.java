package core.widget.filter;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import core.widget.ListHelper;
import core.widget.filter.filter.CheckboxFilter;
import core.widget.filter.filter.DateFilter;
import core.widget.filter.filter.DateTimeFilter;
import core.widget.filter.filter.DateTimeWithSecondsFilter;
import core.widget.filter.filter.DictionaryFilter;
import core.widget.filter.filter.FileUploadFilter;
import core.widget.filter.filter.HintFilter;
import core.widget.filter.filter.InlinePickListFilter;
import core.widget.filter.filter.InputFilter;
import core.widget.filter.filter.MoneyFilter;
import core.widget.filter.filter.MultiFieldFilter;
import core.widget.filter.filter.MultiValueFilter;
import core.widget.filter.filter.MultiValueHoverFilter;
import core.widget.filter.filter.MultipleSelectFilter;
import core.widget.filter.filter.NumberFilter;
import core.widget.filter.filter.PercentFilter;
import core.widget.filter.filter.RadioFilter;
import core.widget.filter.filter.TextFilter;
import core.widget.filter.filter.TimeFilter;
import core.widget.modal.Popup;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.Optional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Getter
@Slf4j
public class ListFilter {

    protected final String columnType;

    protected final String columnName;

    protected final ListHelper helper;

    protected final SelenideElement widget;

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    /**
     * Filtering with the field type Input
     *
     * @return InputFilter
     */
    public InputFilter inputFilter() {
        return Allure.step("Filtering with the field type Input", step -> {
            logTime(step);
            return new InputFilter(columnType, columnName, helper);
        });

    }

    /**
     * Filtering with the field type Date
     *
     * @return DateFilter
     */

    public DateFilter dateFilter() {
        return Allure.step("Filtering with the field type Date", step -> {
            logTime(step);

            return new DateFilter(columnType, columnName, helper);
        });

    }

    /**
     * Filtering with the field type DateTime
     *
     * @return DateTimeFilter
     */
    public DateTimeFilter dateTimeFilter() {
        return Allure.step("Filtering with the field type DateTime", step -> {
            logTime(step);
            return new DateTimeFilter(columnType, columnName, helper);
        });

    }

    /**
     * Filtering with the field type DateTimeWithSeconds
     *
     * @return DateTimeWithSecondsFilter
     */
    public DateTimeWithSecondsFilter dateTimeWithSecondsFilter() {
        return Allure.step("Filtering with the field type DateTimeWithSeconds", step -> {
            logTime(step);
            return new DateTimeWithSecondsFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type DateTime
     *
     * @return DateTimeFilter
     */
    public TimeFilter timeFilter(String format) {
        return Allure.step("Filtering with the field type Time", step -> {
            logTime(step);
            return new TimeFilter(columnType, columnName, helper, format);
        });

    }

    /**
     * Filtering with the field type Money
     *
     * @return MoneyFilter
     */
    public MoneyFilter moneyFilter() {
        return Allure.step("Filtering with the field type Money", step -> {
            logTime(step);
            return new MoneyFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type Number
     *
     * @return NumberFilter
     */
    public NumberFilter numberFilter() {
        return Allure.step("Filtering with the field type Number", step -> {
            logTime(step);
            return new NumberFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type Percent
     *
     * @return PercentFilter
     */
    public PercentFilter percentFilter() {
        return Allure.step("Filtering with the field type Percent", step -> {
            logTime(step);
            return new PercentFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type CheckBox
     *
     * @return CheckboxFilter
     */
    public CheckboxFilter checkboxFilter() {
        return Allure.step("Filtering with the field type CheckBox", step -> {
            logTime(step);
            return new CheckboxFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type Radio
     *
     * @return RadioFilter
     */
    public RadioFilter radioFilter() {
        return Allure.step("Filtering with the field type Radio", step -> {
            logTime(step);
            return new RadioFilter(columnType, columnName, helper);
        });

    }

    /**
     * Filtering with the field type Dictionary
     *
     * @return DictionaryFilter
     */
    public DictionaryFilter dictionaryFilter() {
        return Allure.step("Filtering with the field type Dictionary", step -> {
            logTime(step);
            return new DictionaryFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type FileUpload
     *
     * @return FileUploadFilter
     */
    public FileUploadFilter fileUploadFilter() {
        return Allure.step("Filtering with the field type FileUpload", step -> {
            logTime(step);
            return new FileUploadFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type InlinePickList
     *
     * @return InlinePickListFilter
     */
    public InlinePickListFilter inlinePickListFilter() {
        return Allure.step("Filtering with the field type InlinePickList", step -> {
            logTime(step);
            return new InlinePickListFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type PickList
     *
     * @return PickListFilter
     */
    public Optional<Popup> pickListFilter() {
        return Allure.step("Filtering with the field type PickList", step -> {
            logTime(step);
            if ($("div[class=\"ant-popover ant-popover-placement-top\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .$("button[class=\"ant-btn ant-btn-icon-only\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .is(Condition.visible)) {

                $("div[class=\"ant-popover ant-popover-placement-top\"]")
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                        .$("button[class=\"ant-btn ant-btn-icon-only\"]")
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout)).click();

                return Optional.of(new Popup());
            } else {
                log.info("Новая фильтрация не поддерживается.");
                return Optional.empty();

            }
        });
    }

    /**
     * Filtering with the field type MultiField
     *
     * @return MultiFieldFilter
     */
    public MultiFieldFilter multiFieldFilter() {
        return Allure.step("Filtering with the field type MultiField", step -> {
            logTime(step);
            return new MultiFieldFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type MultipleSelect
     *
     * @return MultipleSelectFilter
     */
    public MultipleSelectFilter multipleSelectFilter() {
        return Allure.step("Filtering with the field type MultipleSelect", step -> {
            logTime(step);
            return new MultipleSelectFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type multiValue
     *
     * @return MultiValueFilter
     */
    public MultiValueFilter multiValueFilter() {
        return Allure.step("Filtering with the field type MultiValue", step -> {
            logTime(step);
            return new MultiValueFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type MultiValueHover
     *
     * @return MultiValueHoverFilter
     */
    public MultiValueHoverFilter multiValueHoverFilter() {
        return Allure.step("Filtering with the field type MultiValueHover", step -> {
            logTime(step);
            return new MultiValueHoverFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type Text
     *
     * @return TextFilter
     */
    public TextFilter textFilter() {
        return Allure.step("Filtering with the field type Text", step -> {
            logTime(step);
            return new TextFilter(columnType, columnName, helper);
        });
    }

    /**
     * Filtering with the field type Hint
     *
     * @return HintFilter
     */

    public HintFilter hintFilter() {
        return Allure.step("Filtering with the field type Hint", step -> {
            logTime(step);
            return new HintFilter(columnType, columnName, helper);
        });
    }
}