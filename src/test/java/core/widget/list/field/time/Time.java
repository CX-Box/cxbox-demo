package core.widget.list.field.time;

import com.codeborne.selenide.Condition;
import core.widget.ListHelper;
import core.widget.TestingTools.Constants;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import core.widget.modal.Calendar;
import io.qameta.allure.Step;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Time extends BaseRow<LocalDateTime> {
    private String format = "HH:mm:ss";

    public Time(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean sort, Boolean filter, String format) {
        super(listWidget, title, "time", id, listHelper, sort, filter);
        this.format = format;
    }

    /**
     * Date input: year, month, day
     *
     * @param value LocalDate
     *              {@code example} LocalDate date = LocalDate.of(2024, 20,5)
     */
    @Override
    @Step("Setting the {value} in the field")
    public void setValue(LocalDateTime value) {
        setFocusField();
        clearIcon();

        getRowByName().click();
        Calendar.setTimeWithSecond(value, format);
    }

    /**
     * Getting the date in the data type -  LocalDate
     *
     * @return LocalDate date
     */
    @Override
    @Step("Getting a value from a field")
    public LocalDateTime getValue() {
        setFocusField();
        String time = getRowByName()
                .shouldBe(Condition.exist)
                .$(getValueTag())
                .getValue();

        LocalTime times = LocalTime.parse(time, DateTimeFormatter.ofPattern(format));
        LocalDateTime dateTime = times.atDate(LocalDate.of(2024, 12, 5));

        return dateTime;
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    /**
     * Clearing the field through the cross icon.
     */
    @Step("Clearing the field")
    public void clearIcon() {
        getRowByName()
                .$("i[aria-label=\"icon: close-circle\"]")
                .hover()
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .click();


    }

    /**
     * Getting the field color in Hex format
     *
     * @return String/null
     */
    @Step("Getting the field color in Hex format")
    public String getHexColor() {
        setFocusField();
        String color = getValueByAttribute(1, "span", "style");
        Pattern pattern = Pattern.compile("rgb\\((\\d{1,3}, \\d{1,3}, \\d{1,3})\\)");
        Matcher matcher = pattern.matcher(color);

        if (matcher.find()) {
            String rgb = matcher.group(1);
            String NewRGB = rgb.replaceAll(" ", "");
            String[] strings = NewRGB.split("[,\\\\s]+");
            int[] numbers = new int[strings.length];
            for (int i = 0; i < strings.length; i++) {
                numbers[i] = Integer.parseInt(strings[i]);
            }
            return String.format(Constants.FormatForRgb, numbers[0], numbers[1], numbers[2]);
        } else {
            return null;
        }
    }

    @Override
    @Step("Focus on the segment")
    public void setFocusField() {
        if (getRowByName().$("span[class*=\"ReadOnlyField\"]").is(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))) {
            log.info("Focus on the field");
            getRowByName()
                    .parent()
                    .click();
        } else {
            log.error("Focus on the field didn't work out");
        }
    }
}